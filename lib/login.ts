"use server";

import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginUser = actionClient
  .inputSchema(loginSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { email, password } }) => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = existingUser[0];
    if (!user) {
      return {
        success: false,
        fieldErrors: { email: "Invalid email." },
      };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return {
        success: false,
        fieldErrors: { unauthorised: "Invalid email or password" },
      };
    }

    return {
      isSuccess: true,
    };
  });
