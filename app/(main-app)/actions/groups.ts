import { expense_shares, expenses, groups, members, users } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";

export async function getUserGroups(userId: string) {
  console.log("TRIGGERED: [getUserGroups]");
  // Fetch groups where the user is a member (not just the creator)
  const userGroups = await db
    .select({
      id: groups.id,
      name: groups.name,
      active: groups.active,
      created_by: groups.created_by,
      created_at: groups.created_at,
    })
    .from(members)
    .innerJoin(groups, eq(members.group_id, groups.id))
    .where(eq(members.user_id, userId));

  // Calculate total debt across all groups
  let totalDebt = 0;

  // get all expenseShares for each group
  for (const group of userGroups) {
    const member = await db
      .select({ memberId: members.id })
      .from(members)
      .where(and(eq(members.user_id, userId), eq(members.group_id, group.id)))
      .limit(1)
      .then((res) => res[0]);

    const memberCount = await db
      .select({ count: members.id })
      .from(members)
      .where(eq(members.group_id, group.id))
      .then((res) => res.length);

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
      })
      .from(expenses)
      .leftJoin(
        expense_shares,
        and(
          eq(expense_shares.expense_id, expenses.id),
          eq(expense_shares.member_id, member.memberId)
        )
      )
      .where(eq(expenses.group_id, group.id));

    // Calculate group debt for this specific group
    let groupDebt = 0;

    // const expensesWithShares = 
    groupExpenses.map((expense) => {
      let yourShare: number;

      if (expense.isEqual) {
        // Equal split: divide amount by total member count
        const expenseAmount = parseFloat(expense.amount);
        yourShare = expenseAmount / memberCount;
      } else {
        // Use the share amount from expense_shares table
        // The share field contains the actual amount this member owes
        yourShare = parseFloat(expense.share || "0");
      }

      // Add to group debt
      groupDebt += yourShare;

      return {
        ...expense,
        yourShare: yourShare.toFixed(2),
      };
    });

    // Add group debt to total debt
    totalDebt += groupDebt;

    // Add total debt to the group data
    (group as any).totalDebt = groupDebt.toFixed(2);
  }

  return {
    userGroups,
    totalDebt: totalDebt.toFixed(2),
  };
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
      .leftJoin(
        expense_shares,
        and(
          eq(expense_shares.expense_id, expenses.id),
          eq(expense_shares.member_id, member.memberId)
        )
      )
      .where(and(eq(expenses.group_id, groupId)))
    // Calculate yourShare for each expense and total group debt
    let totalGroupDebt = 0;

    const expensesWithShare = groupExpenses.map((expense) => {
      let yourShare: string;

      if (expense.isEqual) {
        // Equal split: divide amount by total member count
        const amount = parseFloat(expense.amount);
        const equalShare = amount / memberCount;
        yourShare = equalShare.toFixed(2);
        totalGroupDebt += equalShare;
      } else {
        // Use the existing share value from expense_shares table
        //expense.share is the percentage
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
