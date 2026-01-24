"use server";

import { z } from "zod";
import { db } from "@/db";
import { otpChallenges, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { flattenValidationErrors } from "next-safe-action";
import { publicAction } from "./public-action";
import { headers } from "next/headers";
import crypto from "crypto";
import { sendOtp } from "./mailer";

// export const runtime = "nodejs";

const OTP_TTL_MS = 10 * 60 * 10000;

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const loginOtpSchema = z.object({
  email: z.email(),
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

function generateOtp() {
  const digit = Math.floor(Math.random() * 1_000_000);
  const otpString = String(digit).padStart(6, "0");
  return otpString;
}

function hashOtp(challengeId: string, otp: string) {
  const secret = process.env.OTP_SECRET;
  const cryptoResult = crypto
    .createHash("sha256")
    .update(`${challengeId}:${otp}:${secret}`)
    .digest("hex");
  return cryptoResult;
}

export const loginUser = publicAction
  .metadata({ actionName: "loginUser" })
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

    const invalid = {
      success: false as const,
      fieldErrors: { unauthorised: "Invalid email or password" },
    };
    if (!user) return invalid;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return invalid;

    return {
      success: true,
    };
  });

export const loginOtp = publicAction
  .metadata({ actionName: "loginOtp" })
  .inputSchema(loginOtpSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { email } }) => {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = existingUser[0];

    const challengeId = crypto.randomUUID();
    const otp = generateOtp();
    const codeHash = hashOtp(challengeId, otp);
    const { ip, userAgent } = await getRequestMeta();

    await db.insert(otpChallenges).values({
      id: challengeId, // optional; you can omit since defaultRandom()
      email,
      code_hash: codeHash,
      expires_at: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
      used_at: null,
      created_at: new Date(), // optional; you can omit since defaultNow()
      ip,
      user_agent: userAgent,
    });
    await sendOtp({ to: email, code: otp });

    return { success: true, challengeId };
  });

export const resendCode = publicAction
  .metadata({ actionName: "resendCode" })
  .inputSchema(resendCodeSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { email, challengeId } }) => {
    const newchallengeId = crypto.randomUUID();
    const otp = generateOtp();
    const codeHash = hashOtp(newchallengeId, otp);
    const { ip, userAgent } = await getRequestMeta();

    await db.transaction(async (tx) => {
      await tx
        .update(otpChallenges)
        .set({ used_at: new Date() })
        .where(eq(otpChallenges.id, challengeId));

      await tx.insert(otpChallenges).values({
        id: newchallengeId, // optional; you can omit since defaultRandom()
        email,
        code_hash: codeHash,
        expires_at: new Date(Date.now() + OTP_TTL_MS),
        attempts: 0,
        used_at: null,
        created_at: new Date(), // optional; you can omit since defaultNow()
        ip,
        user_agent: userAgent,
      });
    });

    await sendOtp({ to: email, code: otp });

    return { success: true, challengeId: newchallengeId };
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
