import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users, otpChallenges } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { NextAuthOptions } from "next-auth";

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

// @ts-ignore
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // existing
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },

        method: { label: "Method", type: "text" }, // "password" | "otp"
        challengeId: { label: "Challenge ID", type: "text" },
        code: { label: "Code", type: "text" },
      },

      async authorize(credentials) {
        const method = String(credentials?.method ?? "password");
        const email = normalizeEmail(String(credentials?.email ?? ""));

        if (!email || !email.includes("@")) return null;

        // -------- OTP LOGIN --------
        if (method === "otp") {
          const challengeId = String(credentials?.challengeId ?? "");
          const code = String(credentials?.code ?? "").trim();

          if (!challengeId || !/^\d{6}$/.test(code)) return null;

          const foundChallenge = await db
            .select()
            .from(otpChallenges)
            .where(eq(otpChallenges.id, challengeId))
            .limit(1);

          const challenge = foundChallenge[0];
          if (!challenge) return null;

          // validate challenge belongs to that email and is usable
          if (normalizeEmail(String(challenge.email)) !== email) return null;
          if (challenge.used_at) return null;
          if ((challenge.attempts ?? 0) >= MAX_OTP_ATTEMPTS) return null;

          const expiresAt = new Date(challenge.expires_at).getTime();
          if (Date.now() > expiresAt) return null;

          // compare hash
          const expected = String(challenge.code_hash);
          const actual = hashOtp(challengeId, code);

          if (actual !== expected) {
            await db
              .update(otpChallenges)
              .set({ attempts: (challenge.attempts ?? 0) + 1 })
              .where(eq(otpChallenges.id, challengeId));

            return null;
          }

          // mark used
          await db
            .update(otpChallenges)
            .set({ used_at: new Date() })
            .where(eq(otpChallenges.id, challengeId));

          // find user by email (no auto-create for now)
          const foundUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          const user = foundUser[0];
          if (!user) return null;

          return { id: user.id, name: user.username, email: user.email };
        }

        // -------- PASSWORD LOGIN (existing) --------
        if (!credentials?.password) return null;

        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        const user = found[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return { id: user.id, name: user.username, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// @ts-ignore
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
