import { expense_shares, expenses, groups, members, users } from "@/db/schema";
import { db } from "@/db";
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getSummaryCached = (userId: string) =>
  unstable_cache(
    () => getTotalUnpaidShares(userId),
    ["summary", userId],
    { tags: [`user:${userId}:summary`], revalidate: 15 }
  )();
async function getTotalUnpaidShares(userId: string) {
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


export const getUserGroupsCached = (userId: string) =>
  unstable_cache(
    () => getUserGroups(userId),
    ["userGroups", userId],
    { tags: [`user:${userId}:groups`], revalidate: 60 }
  )();
async function getUserGroups(userId: string) {
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

export const getGroupWithMembersCached = (groupId: string) =>
  unstable_cache(
    () => getGroupWithMembers(groupId),
    ["groupWithMembers", groupId],
    { tags: [`group:${groupId}:members`], revalidate: 60 }
  )();
async function getGroupWithMembers(groupId: string) {
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

export async function getGroupExpenses(
  groupId: string,
  userId: string,
  opts: { page: number; pageSize: number }
) {
  try {
    const page = Math.max(1, Number(opts.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(opts.pageSize || 20)));
    const offset = (page - 1) * pageSize;

    // Get this user's memberId for the group
    const member = await db
      .select({ memberId: members.id })
      .from(members)
      .where(and(eq(members.user_id, userId), eq(members.group_id, groupId)))
      .limit(1)
      .then((res) => res[0]);

    if (!member) {
      return { expenses: [], totalCount: 0 };
    }

    // Base filter: expenses in group where THIS member has an unpaid share
    const whereUnpaidForMember = and(
      eq(expenses.group_id, groupId),
      eq(expense_shares.member_id, member.memberId),
      eq(expense_shares.paid, false)
    );

    // Page query + count query in parallel
    const [groupExpenses, countRow] = await Promise.all([
      db
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
        // innerJoin because we require a share row for this member anyway
        .innerJoin(expense_shares, eq(expense_shares.expense_id, expenses.id))
        .where(whereUnpaidForMember)
        // deterministic ordering for stable pagination
        .orderBy(desc(expenses.created_at), desc(expenses.id))
        .limit(pageSize)
        .offset(offset),

      db
        .select({
          total: sql<number>`COUNT(DISTINCT ${expenses.id})`.as("total"),
        })
        .from(expenses)
        .innerJoin(expense_shares, eq(expense_shares.expense_id, expenses.id))
        .where(whereUnpaidForMember)
        .then((r) => r[0]),
    ]);

    const totalCount = Number(countRow?.total ?? 0);

    // Only fetch memberIds for the current page of expenses
    const expenseIds = groupExpenses.map((e) => e.id);

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

    const expensesClean = groupExpenses.map((expense) => ({
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
    }));

    return {
      expenses: expensesClean,
      totalCount,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    return { expenses: [], totalCount: 0, page: 1, pageSize: opts.pageSize, totalPages: 1 };
  }
}



