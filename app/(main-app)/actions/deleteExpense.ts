"use server";

import { z } from "zod";
import { protectedAction } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { expenses } from "@/db/schema";
import { db } from "@/db";
import { and, eq, inArray } from "drizzle-orm";

const deleteExpenseSchema = z.object({
  expenseIds: z.array(z.string().min(1)).min(1),
});

export const deleteExpense = protectedAction
  .inputSchema(deleteExpenseSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { expenseIds }, ctx }) => {
    const userID = ctx.user.id;

    const deletedExpenses = await db
      .delete(expenses)
      .where(and(inArray(expenses.id, expenseIds)))
      .returning({ id: expenses.id });

    if (deletedExpenses.length === 0) {
      return {
        isSuccess: false,
        message: "No expenses were deleted",
      };
    }

    const deletedIds = deletedExpenses.map((expense) => expense.id);
    const notDeletedCount = expenseIds.length - deletedExpenses.length;

    return {
      isSuccess: true,
      message:
        notDeletedCount > 0
          ? `Deleted ${deletedExpenses.length} expense(s). ${notDeletedCount} could not be deleted.`
          : "Expense(s) deleted",
      deletedIds,
    };
  });
