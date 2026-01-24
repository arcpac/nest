// app/api/auth/otp/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/db"; // adjust path
import { otpChallenges, users } from "@/db/schema"; // adjust path

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashOtp(challengeId: string, otp: string) {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("Missing OTP_SECRET env var");

  return crypto
    .createHash("sha256")
    .update(`${challengeId}:${otp}:${secret}`)
    .digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const email = normalizeEmail(String(body.email ?? ""));
  const challengeId = String(body.challengeId ?? "");
  const code = String(body.code ?? "").trim();

  // Generic error helper (don’t leak details)
  const invalid = () =>
    NextResponse.json({ ok: false, error: "Invalid code" }, { status: 400 });

  if (!email || !email.includes("@") || !challengeId || code.length !== 6) {
    return invalid();
  }

  // Optional: rate limit here (you said you already have it wired ✅)
  // const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  // await rateLimitOrThrow(`otp:verify:ip:${ip}`, { limit: 10, windowMs: 60_000 });
  // await rateLimitOrThrow(`otp:verify:email:${email}`, { limit: 5, windowMs: 600_000 });

  const [challenge] = await db
    .select()
    .from(otpChallenges)
    .where(eq(otpChallenges.id, challengeId))
    .limit(1);

  if (!challenge) return invalid();

  // Basic checks
  if (challenge.email !== email) return invalid();
  if (challenge.used_at) return invalid();
  if (challenge.attempts >= MAX_ATTEMPTS) return invalid();

  const expiresAt = new Date(challenge.expires_at).getTime();
  if (Date.now() > expiresAt) return invalid();

  // Compare hashes
  const expectedHash = challenge.code_hash;
  const actualHash = hashOtp(challengeId, code);

  if (actualHash !== expectedHash) {
    // increment attempts
    await db
      .update(otpChallenges)
      .set({ attempts: challenge.attempts + 1 })
      .where(eq(otpChallenges.id, challengeId));

    return invalid();
  }

  // Mark used
  await db
    .update(otpChallenges)
    .set({ used_at: new Date() })
    .where(eq(otpChallenges.id, challengeId));

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    // If you want OTP to auto-create accounts, do it here instead of failing.
    return NextResponse.json(
      { ok: false, error: "No account found for this email" },
      { status: 404 }
    );
  }

  /**
   * ✅ TODO: Create a session here (cookie/JWT) using your existing auth system.
   * Examples:
   * - create a row in sessions table and set httpOnly cookie
   * - or sign a JWT and set it as cookie
   *
   * For now, we just return success + userId.
   */
  return NextResponse.json({ ok: true, userId: user.id });
}
