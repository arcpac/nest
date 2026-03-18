import { Group } from "@/app/types";
import { db } from "@/db";

import { expense_shares, groups, members, users } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { GqlContext } from "./context";
import { getGroupExpenses } from "@/app/(main-app)/actions/groupExpenses";
import { getUserGroups } from "@/app/(main-app)/actions/groups";
import { payExpense } from "@/app/(main-app)/actions/payExpense";
import { payExpenseTestCore } from "@/lib/server/payExpenseTestCore";
import { getUserExpenseShares } from "@/app/(main-app)/actions/expenseList";

export const resolvers = {
    Query: {
        getGroups: async (_: unknown, args: { limit?: number }, ctx: GqlContext) => {
            if (!ctx.userId) {
                throw new Error("Unauthorized");
            }
            const userId = ctx.userId
            const userGroups = await getUserGroups(userId)
            return userGroups
        },
        userExpenseShares: async (_: unknown, args: { limit?: number, userId: string }, ctx: GqlContext) => {
            if (!ctx.userId) {
                throw new Error("Unauthorized");
            }
            const userId = ctx.userId;
            const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);

            const userMemberships = await db
                .select({ id: members.id })
                .from(members)
                .where(eq(members.user_id, userId));

            if (userMemberships.length === 0) {
                return [];
            }
            // insert limit soon
            const expenses = await getUserExpenseShares(args.userId)
            return expenses
        },
        getGroupExpenses: async (_: unknown, args: { limit?: number, groupId: string }, ctx: GqlContext) => {
            if (!ctx.userId) {
                throw new Error("Unauthorized");
            }
            const userId = ctx.userId;
            const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);

            const userMemberships = await db
                .select({ id: members.id })
                .from(members)
                .where(eq(members.user_id, userId));

            if (userMemberships.length === 0) {
                return [];
            }

            const expenses = await getGroupExpenses(args.groupId, userId)
            return expenses
        },
        group: async (_: Group, args: { groupId: string }, ctx: GqlContext) => {
            if (!ctx.userId) return null

            const [membership] = await db
                .select()
                .from(members)
                .where(and(eq(members.group_id, args.groupId), eq(members.user_id, ctx.userId)))
                .limit(1)

            if (!membership) return null

            const [group] = await db
                .select()
                .from(groups)
                .where(eq(groups.id, args.groupId))
                .limit(1)
            return group
        },
        dashboardSummary: async (_: unknown, __: unknown, ctx: GqlContext) => {
            if (!ctx.userId) throw new Error("Unauthorized");
            const userId = ctx.userId;
            const rows = await db
                .select({
                    amount: expense_shares.share,
                })
                .from(expense_shares)
                .leftJoin(members, eq(members.id, expense_shares.member_id))
                .where(and(eq(members.user_id, userId), eq(expense_shares.paid, false)));
            const total = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
            return { totalDebt: total };
        },

    },
    Mutation: {
        payExpenseShares: async (_: unknown, args: { expenseIds: string[] }, ctx: GqlContext) => {
            if (!ctx.userId) throw new Error("Unauthorized");

            const ids = (args.expenseIds ?? []).filter(Boolean);
            if (!ids.length) {
                return { isSuccess: false, message: "No shares selected", updatedCount: 0 };
            }

            const result = await payExpenseTestCore(ctx.userId, args.expenseIds);

            return {
                isSuccess: result.isSuccess,
                message: result.message,
                updatedCount: result.updatedExpenseIds?.length ?? 0, // or result.updatedCount if you return that
            };
        },


    },
    Group: {
        members: async (group: { id: string }) => {
            return db.select().from(members).where(eq(members.group_id, group.id));
        },
    },
    Member: {
        user: async (member: { user_id: string }) => {
            const [u] = await db.select().from(users).where(eq(users.id, member.user_id));
            return u ?? null;
        },
    },
};
