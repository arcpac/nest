"use server";

import { z } from "zod";
import { protectedAction } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { db } from "@/db";
import { expense_shares, members } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { payExpenseTestCore } from "@/lib/server/payExpenseTestCore";

const payExpenseSchema = z.object({
    expenseIds: z.array(z.string().min(1)).min(1),
});


export const payExpenseTest = protectedAction
    .inputSchema(payExpenseSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: { expenseIds }, ctx }) => {
        const userId = ctx.user.id;
        return payExpenseTestCore(userId, expenseIds);
    });
