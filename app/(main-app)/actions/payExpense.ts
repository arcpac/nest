"use server";

import { z } from "zod";
import { protectedAction } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { db } from "@/db";
import { expense_shares, members } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

const payExpenseSchema = z.object({
  expenseIds: z.array(z.string().min(1)).min(1),
});

export const payExpense = protectedAction
  .inputSchema(payExpenseSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { expenseIds }, ctx }) => {
    const userId = ctx.session.user.id;

    const memberRows = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.user_id, userId));

    if (memberRows.length === 0) {
      return {
        isSuccess: false,
        message: "Member not found for this user",
      };
    }

    const memberIds = memberRows.map((row) => row.id);

    const updatedShares = await db
      .update(expense_shares)
      .set({ paid: true })
      .where(
        and(
          inArray(expense_shares.expense_id, expenseIds),
          inArray(expense_shares.member_id, memberIds)
        )
      )
      .returning({
        id: expense_shares.id,
        expenseId: expense_shares.expense_id,
      });

    if (updatedShares.length === 0) {
      return {
        isSuccess: false,
        message: "No expenses were updated",
      };
    }

    const updatedExpenseIds = Array.from(
      new Set(updatedShares.map((share) => share.expenseId))
    );
    const notUpdatedCount = expenseIds.length - updatedExpenseIds.length;

    return {
      isSuccess: true,
      message:
        notUpdatedCount > 0
          ? `Paid ${updatedExpenseIds.length} expense(s). ${notUpdatedCount} could not be updated.`
          : "Expense(s) paid",
      updatedExpenseIds,
    };
  });
