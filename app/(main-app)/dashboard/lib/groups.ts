import { expense_shares, expenses, groups, members, users } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";

export async function getUserGroups(userId: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return db
    .select({
      id: groups.id,
      name: groups.name,
      active: groups.active,
      created_by: groups.created_by,
      created_at: groups.created_at,
    })
    .from(groups)
    .where(eq(groups.created_by, userId));
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
    // First get the member ID for the user in this group
    const member = await db
      .select({ memberId: members.id })
      .from(members)
      .where(
        and(
          eq(members.user_id, userId),
          eq(members.group_id, groupId)
        )
      )
      .limit(1)
      .then((res) => res[0]);

    if (!member) {
      return { expenses: [] };
    }

    // Get all expenses for the group with the user's share amount calculated
    const groupExpenses = await db
      .select({
        id: expenses.id,
        title: expenses.title,
        amount: expenses.amount,
        description: expenses.description,
        created_by: expenses.created_by,
        groupId: expenses.group_id,
        createdAt: expenses.created_at,
        sharePercentage: expense_shares.share, // The percentage this user owes for this expense
        paid: expense_shares.paid, // Whether the user has paid their share
      })
      .from(expenses)
      .leftJoin(
        expense_shares,
        and(
          eq(expense_shares.expense_id, expenses.id),
          eq(expense_shares.member_id, member.memberId)
        )
      )
      .where(eq(expenses.group_id, groupId));

    // Calculate the actual amount owed by each user
    const expensesWithCalculatedAmounts = groupExpenses.map(expense => {
      const sharePercentage = expense.sharePercentage ? parseFloat(expense.sharePercentage) : 0;
      const expenseAmount = parseFloat(expense.amount);
      const sharedAmount = (expenseAmount * sharePercentage) / 100;
      
      return {
        ...expense,
        sharedAmount: sharedAmount.toFixed(2), // Convert to string with 2 decimal places
      };
    });

    return { expenses: expensesWithCalculatedAmounts };
  } catch (error) {
    console.error("Error fetching group expenses:", error);
    return { expenses: [] };
  }
}
