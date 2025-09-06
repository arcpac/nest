"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import bcrypt from "bcryptjs";
import { flattenValidationErrors } from "next-safe-action";
import { users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.email().min(3).max(100),
  password: z.string().min(6).max(100),
});

export const registerUser = actionClient
  .inputSchema(registerSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { name, email, password } }) => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        fieldErrors: { email: "Email is already taken" },
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return { isSuccess: true, message: "User successfully created" };
  });
