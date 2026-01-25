import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendOtp } from "@/lib/mailer";
import { db } from "@/db";
import { otpChallenges } from "@/db/schema";

export const runtime = "nodejs";

const OTP_TTL_MS = 10 * 60 * 10000;

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

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const emailRaw = String(body.email || "");
  const email = normalizeEmail(emailRaw);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: true });
  }

  const challengeId = crypto.randomUUID();
  const otp = generateOtp();
  const codeHash = hashOtp(challengeId, otp);

  // Store in DB (pseudo)
  await db.insert(otpChallenges).values({
    id: challengeId, // optional; you can omit since defaultRandom()
    email,
    code_hash: codeHash,
    expires_at: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    used_at: null,
    created_at: new Date(), // optional; you can omit since defaultNow()
    ip,
    user_agent: req.headers.get("user-agent") ?? null,
  });

  await sendOtp({ to: email, code: otp });

  return NextResponse.json({ ok: true, challengeId });
}
