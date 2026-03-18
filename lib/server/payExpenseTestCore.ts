import "server-only";

import { db } from "@/db";
import { expense_shares, members } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export type PayExpenseTestResult = {
    isSuccess: boolean;
    message: string;
    updatedCount: number;
    updatedExpenseIds: string[];
};

export async function payExpenseTestCore(
    userId: string,
    expenseIds: string[]
): Promise<PayExpenseTestResult> {
    const ids = (expenseIds ?? []).filter(Boolean);

    if (!ids.length) {
        return {
            isSuccess: false,
            message: "No expenses selected",
            updatedCount: 0,
            updatedExpenseIds: [],
        };
    }

    // Find memberships for this user (guard: user can only update their own shares)
    const memberRows = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.user_id, userId));

    if (memberRows.length === 0) {
        return {
            isSuccess: false,
            message: "Member not found for this user",
            updatedCount: 0,
            updatedExpenseIds: [],
        };
    }

    const memberIds = memberRows.map((row) => row.id);

    // ✅ Update by expense_shares.expense_id since we are receiving EXPENSE ids
    const updatedShares = await db
        .update(expense_shares)
        .set({ paid: true })
        .where(
            and(
                inArray(expense_shares.expense_id, ids),
                inArray(expense_shares.member_id, memberIds)
            )
        )
        .returning({
            id: expense_shares.id,
            expenseId: expense_shares.expense_id,
        });

    if (updatedShares.length === 0) {
        return {
            isSuccess: false,
            message: "No expenses were updated",
            updatedCount: 0,
            updatedExpenseIds: [],
        };
    }

    const updatedExpenseIds = Array.from(
        new Set(updatedShares.map((s) => s.expenseId))
    );

    // This measures "how many expenseIds had at least 1 share updated"
    const notUpdatedCount = ids.length - updatedExpenseIds.length;

    return {
        isSuccess: true,
        message:
            notUpdatedCount > 0
                ? `Paid ${updatedExpenseIds.length} expense(s). ${notUpdatedCount} could not be updated.`
                : "Expense(s) paid",
        updatedCount: updatedShares.length, // number of share rows updated
        updatedExpenseIds,
    };
}
