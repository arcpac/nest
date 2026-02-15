"use server";

import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { publicAction } from "./public-action";
import { headers } from "next/headers";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";


const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const resendCodeSchema = z.object({
  email: z.email(),
  challengeId: z.string(),
});

export async function getRequestMeta() {
  const h = await headers();

  const xff = h.get("x-forwarded-for");
  const ip =
    (xff ? xff.split(",")[0].trim() : null) ??
    h.get("x-real-ip") ??
    h.get("cf-connecting-ip") ??
    "unknown";

  const userAgent = h.get("user-agent") ?? null;

  return { ip, userAgent };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const loginUser = publicAction
  .metadata({ actionName: "loginUser" })
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error || !data.session) {
      return {
        success: false as const,
        fieldErrors: { unauthorised: "Invalid email or password" },
      };
    }

    return { success: true as const };
  });


export const codeSubmit = publicAction
  .metadata({ actionName: "codeSubmit" })
  .inputSchema(resendCodeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { email, challengeId } }) => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) return { success: false };
    return { success: true };
  });
