import { expense_shares, expenses, groups, members, users } from "@/db/schema";
import { db } from "@/db";
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { NumberColorFormat } from "@faker-js/faker";

function normalizeAmount(amount: unknown): number {
    if (typeof amount === "number") return amount;
    if (typeof amount === "string") return Number(amount);
    return 0;
}

export type GqlExpense = {
    id: string;
    title: string;
    amount: any; // see NOTE below
    description: string | null;
    myShare: number;
    isEqual: boolean;
    created_by: string;
    created_at: Date;
    isPaid: boolean;
};

export async function getGroupExpenses(
    groupId: string,
    userId: string,
    limit = 20
): Promise<GqlExpense[]> {
    const member = await db
        .select({ memberId: members.id })
        .from(members)
        .where(and(eq(members.user_id, userId), eq(members.group_id, groupId)))
        .limit(1)
        .then((res) => res[0]);

    if (!member) return [];

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
        .from(expenses)
        .leftJoin(
            expense_shares,
            and(
                eq(expense_shares.expense_id, expenses.id),
                eq(expense_shares.member_id, member.memberId)
            )
        )
        .where(eq(expenses.group_id, groupId))
        .orderBy(desc(expenses.created_at))
        .limit(limit);

    return rows.map((e) => ({
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
}