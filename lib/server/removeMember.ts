"use server";

import { z } from "zod";
import { flattenValidationErrors } from "next-safe-action";
import { protectedAction } from "@/lib/safe-action";
import { db } from "@/db";
import { expenses, expense_shares, groups, members } from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

const removeMemberSchema = z.object({
    groupId: z.string().min(1),
    userId: z.string().min(1),
});

export const removeMember = protectedAction
    .metadata({ actionName: "removeMember" })
    .inputSchema(removeMemberSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: { groupId, userId }, ctx }) => {
        const requesterUserId = (ctx as any).user.id;

        // 0) Basic guard: don't allow removing yourself via "remove"
        if (requesterUserId === userId) {
            return {
                isSuccess: false,
                type: "remove-member" as const,
                message: "You can’t remove yourself here. Use a 'Leave group' flow instead.",
            };
        }

        // 1) Permission: only group owner can remove members
        const [group] = await db
            .select({ id: groups.id, created_by: groups.created_by })
            .from(groups)
            .where(eq(groups.id, groupId))
            .limit(1);

        if (!group) {
            return {
                isSuccess: false,
                type: "remove-member" as const,
                message: "Group not found.",
            };
        }

        if (group.created_by !== requesterUserId) {
            return {
                isSuccess: false,
                type: "remove-member" as const,
                message: "Only the group owner can remove members.",
            };
        }

        // 2) Find the member row for this user in this group
        const [memberRow] = await db
            .select({ id: members.id, email: members.email })
            .from(members)
            .where(and(eq(members.group_id, groupId), eq(members.user_id, userId)))
            .limit(1);

        if (!memberRow) {
            return {
                isSuccess: false,
                type: "remove-member" as const,
                message: "Member not found in this group.",
            };
        }

        // 3) Check unpaid shares (pending expenses) for this member in this group
        const [pending] = await db
            .select({
                pendingCount: sql<number>`count(*)`,
                pendingTotal: sql<string>`coalesce(sum(${expense_shares.share}), 0)::text`,
            })
            .from(expense_shares)
            .innerJoin(expenses, eq(expenses.id, expense_shares.expense_id))
            .where(
                and(
                    eq(expenses.group_id, groupId),
                    eq(expense_shares.member_id, memberRow.id),
                    eq(expense_shares.paid, false)
                )
            );

        const pendingCount = Number(pending?.pendingCount ?? 0);

        if (pendingCount > 0) {
            return {
                isSuccess: false,
                type: "remove-member" as const,
                message: `This member has ${pendingCount} unpaid expense share(s). Ask them to settle all pending expenses first.`,
                pendingCount,
                pendingTotal: pending?.pendingTotal ?? "0",
            };
        }

        // 4) Remove the member.
        // IMPORTANT: because expense_shares references members, we delete this member’s shares in this group first.
        // (This will remove history. If you want to preserve history, use a soft-delete approach instead.)
        await db.transaction(async (tx) => {
            const groupExpenseIds = await tx
                .select({ id: expenses.id })
                .from(expenses)
                .where(eq(expenses.group_id, groupId));

            const expenseIds = groupExpenseIds.map((r) => r.id);

            if (expenseIds.length > 0) {
                await tx
                    .delete(expense_shares)
                    .where(
                        and(
                            eq(expense_shares.member_id, memberRow.id),
                            inArray(expense_shares.expense_id, expenseIds)
                        )
                    );
            }

            await tx
                .delete(members)
                .where(and(eq(members.group_id, groupId), eq(members.user_id, userId)));
        });

        return {
            isSuccess: true,
            type: "remove-member" as const,
            message: "Member removed.",
            removedUserId: userId,
        };
    });
