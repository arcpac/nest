import { expense_shares, expenses, groups, members, users } from "@/db/schema";
import { db } from "@/db";
import { and, eq, sql } from "drizzle-orm";

export async function getTotalUnpaidShares(userId: string) {
  console.log('TRIGGER: getTotalUnpaidShares')
  const [row] = await db
    .select({
      totalDebt: sql<string>`COALESCE(SUM(${expense_shares.share}), 0)`.as("totalDebt"),
      unpaidCount: sql<number>`COUNT(*)`.as("unpaidCount"),
    })
    .from(members)
    .innerJoin(expense_shares, eq(expense_shares.member_id, members.id))
    .where(and(eq(members.user_id, userId), eq(expense_shares.paid, false)));

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
    // Artificial delay to test Suspense fallbacks
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // First get the member ID for the user in this group

    const member = await db
      .select({ memberId: members.id })
      .from(members)
      .where(and(eq(members.user_id, userId), eq(members.group_id, groupId)))
      .limit(1)
      .then((res) => res[0]);

    if (!member) {
      return { expenses: [], totalGroupDebt: "0.00" };
    }

    // Get total member count for equal split calculation
    const memberCount = await db
      .select({ count: members.id })
      .from(members)
      .where(eq(members.group_id, groupId))
      .then((res) => res.length);

    // Get all expenses for the group with the user's share amount calculated
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
      .innerJoin(
        expense_shares,
        and(
          eq(expense_shares.expense_id, expenses.id),
          eq(expense_shares.member_id, member.memberId),
          eq(expense_shares.paid, false),
        )
      )
      .where(and(eq(expenses.group_id, groupId)))

    // Calculate yourShare for each expense and total group debt
    let totalGroupDebt = 0;

    const expensesWithShare = groupExpenses.map((expense) => {
      let yourShare: string;

      if (expense.isEqual) {
        const amount = parseFloat(expense.amount);
        const equalShare = amount / memberCount;
        yourShare = equalShare.toFixed(2);
        totalGroupDebt += equalShare;
      } else {
        const shareAmount = parseFloat(expense.share || "0.00");
        yourShare = shareAmount.toFixed(2);
        totalGroupDebt += shareAmount;
      }

      const isPaid = expense.isPaid ?? false;

      return {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        description: expense.description,
        isEqual: expense.isEqual,
        created_by: expense.created_by,
        createdAt: expense.createdAt,
        yourShare,
        isPaid,
      };
    });

    return {
      expenses: expensesWithShare,
      totalGroupDebt: totalGroupDebt.toFixed(2),
    };
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    return { expenses: [], totalGroupDebt: "0.00" };
  }
}




