

import { db } from "@/db";
import { expense_shares, expenses, groups, members } from "@/db/schema";
import { and, eq } from "drizzle-orm";


export async function getUserExpenseShares(userId: string) {
    const userExpenseShares = await db
        .select({
            id: expense_shares.id,
            expenseTitle: expenses.title,
            expenseAmount: expense_shares.share,
            groupName: groups.name,
            paid: expense_shares.paid
        })
        .from(members)
        .innerJoin(expense_shares, eq(expense_shares.member_id, members.id))
        .innerJoin(expenses, eq(expenses.id, expense_shares.expense_id))
        .innerJoin(groups, eq(expenses.group_id, groups.id))
        .where(and(eq(members.user_id, userId)))

    return { userExpenseShares }

}
