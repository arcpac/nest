

import { db } from "@/db";
import { expense_shares, expenses, groups, members } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { GqlExpense } from "./groupExpenses";

function normalizeAmount(amount: unknown): number {
    if (typeof amount === "number") return amount;
    if (typeof amount === "string") return Number(amount);
    return 0;
}

export async function getUserExpenseShares(userId: string): Promise<GqlExpense[]> {
    const rows = await db
        .select({
            id: expenses.id,
            title: expenses.title,
            totalAmount: expenses.amount,
            description: expenses.description,
            isEqual: expenses.isEqual,
            created_by: expenses.created_by,
            created_at: expenses.created_at,
            myShare: expense_shares.share,
            myPaid: expense_shares.paid,
            expenseShareId: expense_shares.id,
        })
        .from(members)
        .innerJoin(expense_shares, eq(expense_shares.member_id, members.id))
        .innerJoin(expenses, eq(expenses.id, expense_shares.expense_id))
        .innerJoin(groups, eq(expenses.group_id, groups.id))
        .where(and(eq(members.user_id, userId)))

    const result = rows.map((e) => ({
        id: e.id,
        title: e.title,
        amount: normalizeAmount(e.totalAmount),
        myShare: normalizeAmount(e.myShare),
        description: e.description ?? null,
        isEqual: e.isEqual,
        created_by: e.created_by,
        created_at: e.created_at,
        isPaid: e.myPaid ?? false,
        expenseShareId: e.expenseShareId
    }));
    console.log('result: ', result)
    return result
}
