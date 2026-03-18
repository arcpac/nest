// app/api/mobile/otp/verify/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpChallenges } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { SignJWT } from "jose";

const MAX_OTP_ATTEMPTS = 5;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashOtp(challengeId: string, code: string) {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("Missing OTP_SECRET");
  return crypto
    .createHash("sha256")
    .update(`${challengeId}:${code}:${secret}`)
    .digest("hex");
}

async function issueMobileToken(user: { id: string; email: string; name?: string | null }) {
  // You can also use a separate MOBILE_JWT_SECRET, but this keeps it simple for now.
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Missing NEXTAUTH_SECRET");

  const key = new TextEncoder().encode(secret);

  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name ?? undefined,
    typ: "mobile",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = normalizeEmail(String(body?.email ?? ""));
    const challengeId = String(body?.challengeId ?? "");
    const code = String(body?.code ?? "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    if (!challengeId || !/^\d{6}$/.test(code)) {

      return NextResponse.json({ ok: false, error: "Invalid code" }, { status: 400 });
    }

    const foundChallenge = await db
      .select()
      .from(otpChallenges)
      .where(eq(otpChallenges.id, challengeId))
      .limit(1);

    const challenge = foundChallenge[0];
    if (!challenge) {
      return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
    }

    // validate challenge belongs to that email and is usable
    if (normalizeEmail(String(challenge.email)) !== email) {
      return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
    }
    if (challenge.used_at) {
      return NextResponse.json({ ok: false, error: "Code already used" }, { status: 401 });
    }
    if ((challenge.attempts ?? 0) >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 });
    }

    const expiresAt = new Date(challenge.expires_at).getTime();
    if (Date.now() > expiresAt) {
      return NextResponse.json({ ok: false, error: "Code expired" }, { status: 401 });
    }

    // compare hash
    const expected = String(challenge.code_hash);
    const actual = hashOtp(challengeId, code);

    if (actual !== expected) {
      await db
        .update(otpChallenges)
        .set({ attempts: (challenge.attempts ?? 0) + 1 })
        .where(eq(otpChallenges.id, challengeId));

      return NextResponse.json({ ok: false, error: "Invalid or expired code" }, { status: 401 });
    }

    // mark used
    await db
      .update(otpChallenges)
      .set({ used_at: new Date() })
      .where(eq(otpChallenges.id, challengeId));

    // find user by email
    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = foundUser[0];
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const token = await issueMobileToken({
      id: user.id,
      email: user.email,
      name: user.username,
    });

    return NextResponse.json(
      {
        ok: true,
        token,
        user: { id: user.id, email: user.email, name: user.username },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to verify code" }, { status: 500 });
  }
}
