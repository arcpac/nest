"use server";

import { db } from "@/db";
import { expenses, expense_shares, members } from "@/db/schema";
import { getServerSession } from "next-auth";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

interface CreateExpenseData {
  groupId: string;
  title: string;
  amount: number;
  description: string | null;
  isEqual: boolean;
  customShares: Record<string, string>;
}

export async function createExpense(data: CreateExpenseData) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      redirect("/login");
    }

    const { groupId, title, amount, description, isEqual, customShares } = data;

    // Validate amount
    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    // Get all members for this group
    const groupMembers = await db
      .select({
        id: members.id,
        user_id: members.user_id,
      })
      .from(members)
      .where(eq(members.group_id, groupId));

    if (groupMembers.length === 0) {
      return { success: false, error: "No members found in this group" };
    }

    // Create the expense
    const [newExpense] = await db
      .insert(expenses)
      .values({
        title,
        amount: amount.toString(),
        description,
        created_by: session.user.id,
        group_id: groupId,
        isEqual,
      })
      .returning();

    // Create expense shares
    if (isEqual) {
      // Equal split
      const shareAmount = amount / groupMembers.length;
      const shareEntries = groupMembers.map((member) => ({
        expense_id: newExpense.id,
        member_id: member.id,
        share: shareAmount.toFixed(2),
        paid: false,
      }));

      await db.insert(expense_shares).values(shareEntries);
    } else {
      // Custom split
      const customShareEntries = groupMembers.map((member) => {
        const customAmount = parseFloat(customShares[member.id] || "0");
        return {
          expense_id: newExpense.id,
          member_id: member.id,
          share: customAmount.toFixed(2),
          paid: false,
        };
      });

      await db.insert(expense_shares).values(customShareEntries);
    }

    return { success: true, expenseId: newExpense.id };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}
