import { expense_shares, expenses, groups, members, users } from "@/db/schema";
import { db } from "@/db";
import { and, eq, inArray, isNotNull, or, sql } from "drizzle-orm";

export async function getTotalUnpaidShares(userId: string) {
  const [row] = await db
    .select({
      totalDebt: sql<string>`
        COALESCE(SUM(${expense_shares.share}), 0)
      `.as("totalDebt"),
      unpaidCount: sql<string>`
        COUNT(*)
      `.as("unpaidCount"),
    })
    .from(members)
    .innerJoin(expense_shares, eq(expense_shares.member_id, members.id))
    .where(
      and(
        eq(members.user_id, userId),
        eq(expense_shares.paid, false)
      )
    );

  return {
    totalDebt: row?.totalDebt ?? "0",
    unpaidCount: Number(row?.unpaidCount ?? 0),
  };
}

export async function getGroupMembers(groupId: string) {
  const groupMembers = await db
    .select({
      id: members.id,
      groupName: groups.name,
      email: members.email
    })
    .from(members)
    .innerJoin(groups, eq(groups.id, members.group_id))
    .where(eq(groups.id, groupId))

  return groupMembers
}

export async function getUserGroups(userId: string) {
  const userGroups = await db.select({
    id: groups.id,
    name: groups.name,
    active: groups.active,
    created_at: groups.created_at,
    created_by: groups.created_by,
  })
    .from(members)
    .innerJoin(groups, eq(members.group_id, groups.id))
    .where(and(eq(members.user_id, userId), eq(groups.active, true)))

  return userGroups
}


export async function getGroupWithMembers(groupId: string) {
  const group = await db
    .select({
      id: groups.id,
      name: groups.name,
      active: groups.active,
      created_by: groups.created_by,
      creator_username: users.username,
      creator_email: users.email,
    })
    .from(groups)
    .where(eq(groups.id, groupId))
    .leftJoin(users, eq(groups.created_by, users.id)) // join condition
    .limit(1)
    .then((res) => res[0]);

  if (!group) return null;

  const membersList = await db
    .select({
      id: members.id,
      user_id: members.user_id,
      first_name: members.first_name,
      last_name: members.last_name,
      email: members.email,
      joined_at: members.joined_at,
    })
    .from(members)
    .where(eq(members.group_id, groupId));

  return { group, members: membersList };
}

export async function getGroupExpenses(groupId: string, userId: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const member = await db
      .select({ memberId: members.id })
      .from(members)
      .where(and(eq(members.user_id, userId), eq(members.group_id, groupId)))
      .limit(1)
      .then((res) => res[0]);

    if (!member) {
      return { expenses: [], totalGroupDebt: "0.00" };
    }

    const groupExpenses = await db
      .select({
        id: expenses.id,
        title: expenses.title,
        amount: expenses.amount,
        description: expenses.description,
        isEqual: expenses.isEqual,
        created_by: expenses.created_by,
        createdAt: expenses.created_at,
        share: expense_shares.share,
        isPaid: expense_shares.paid,
      })
      .from(expenses)
      .leftJoin(
        expense_shares,
        and(
          eq(expense_shares.expense_id, expenses.id),
          eq(expense_shares.member_id, member.memberId)
        )
      )
      .where(
        and(
          eq(expenses.group_id, groupId),
          or(
            eq(expenses.created_by, userId),
            and(isNotNull(expense_shares.member_id), eq(expense_shares.paid, false))
          )
        )
      )


    const expenseIds = groupExpenses.map((expense) => expense.id);
    const expenseMemberIds = expenseIds.length
      ? await db
        .select({
          expenseId: expense_shares.expense_id,
          memberId: expense_shares.member_id,
        })
        .from(expense_shares)
        .where(inArray(expense_shares.expense_id, expenseIds))
      : [];

    const memberIdsByExpense = expenseMemberIds.reduce((acc, share) => {
      const list = acc.get(share.expenseId) ?? [];
      list.push(share.memberId);
      acc.set(share.expenseId, list);
      return acc;
    }, new Map<string, string[]>());

    const expensesClean = groupExpenses.map((expense) => {
      return {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        description: expense.description,
        isEqual: expense.isEqual,
        created_by: expense.created_by,
        createdAt: expense.createdAt,
        shareAmount: expense.share,
        isPaid: expense.isPaid ?? false,
        memberIds: memberIdsByExpense.get(expense.id) ?? [],
      };
    });

    return {
      expenses: expensesClean,
    };
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    return { expenses: [], totalGroupDebt: "0.00" };
  }
}




