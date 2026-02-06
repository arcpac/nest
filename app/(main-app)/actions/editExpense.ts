"use server";

import { z } from "zod";
import { protectedAction } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { expenses, expense_shares, members } from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";

const editExpenseSchema = z.object({
  expenseId: z.string().min(1),
  title: z.string().min(1).max(50),
  amount: z.number().min(0.01),
  description: z.string().optional(),
  selectedMemberIds: z.array(z.string()).optional(),
});

export const editExpense = protectedAction
  .inputSchema(editExpenseSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: { expenseId, title, amount, description, selectedMemberIds },
      ctx,
    }) => {
      const userID = ctx.user.id;

      const [existingExpense] = await db
        .select({
          id: expenses.id,
          isEqual: expenses.isEqual,
          groupId: expenses.group_id,
          userId: expenses.created_by
        })
        .from(expenses)
        .where(and(eq(expenses.id, expenseId)));

      if (!existingExpense) {
        return {
          isSuccess: false,
          message: "Expense not found",
        };
      }

      if (existingExpense.userId !== userID) {
        return {
          isSuccess: false,
          message: "Unable to edit expense. Ask the owner.",
        };
      }

      const [updatedExpense] = await db
        .update(expenses)
        .set({
          title,
          amount: amount.toString(),
          description: description ?? null,
        })
        .where(eq(expenses.id, expenseId))
        .returning({ id: expenses.id, isEqual: expenses.isEqual });

      if (!updatedExpense) {
        return {
          isSuccess: false,
          message: "Failed to update expense",
        };
      }

      if (updatedExpense.isEqual) {
        const groupMembers = await db
          .select({ id: members.id })
          .from(members)
          .where(eq(members.group_id, existingExpense.groupId));

        const existingShares = await db
          .select({
            memberId: expense_shares.member_id,
            paid: expense_shares.paid,
          })
          .from(expense_shares)
          .where(eq(expense_shares.expense_id, expenseId));

        const paidByMember = new Map(
          existingShares.map((share) => [share.memberId, share.paid])
        );

        const validMemberIds = new Set(groupMembers.map((m) => m.id));

        const memberIds = selectedMemberIds?.length
          ? selectedMemberIds.filter((id) => validMemberIds.has(id))
          : existingShares.map((share) => share.memberId);

        if (memberIds.length === 0) {
          return {
            isSuccess: false,
            message: "Please select at least one member",
          };
        }

        const shareAmount = amount / memberIds.length;
        const shareEntries = memberIds.map((memberId) => ({
          expense_id: expenseId,
          member_id: memberId,
          share: shareAmount.toFixed(2),
          paid: paidByMember.get(memberId) ?? false,
        }));

        await db
          .delete(expense_shares)
          .where(eq(expense_shares.expense_id, expenseId));
        await db.insert(expense_shares).values(shareEntries);
      }

      return {
        isSuccess: true,
        message: "Expense successfully updated",
        expenseId: updatedExpense.id,
      };
    }
  );
