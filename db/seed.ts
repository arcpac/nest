// scripts/seed.ts
// DEV cleanup + minimal seed + ensure Supabase Auth password exists.
//
// ✅ Deletes app data (public tables)
// ✅ Ensures Auth user exists and has a known password
// ✅ Upserts profile row in public.users
// ✅ Seeds: 1 group, 1 member
//
// IMPORTANT:
// - Supabase Auth passwords live in auth.users (managed by Supabase).
// - public.users.password does NOT affect login.
// - This script uses SUPABASE_SERVICE_ROLE_KEY (keep it server-only).

import "dotenv/config";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

import { db } from "./db";
import {
  groups,
  users,
  members,
  expenses,
  expense_shares,
  posts,
  otpChallenges,
  // If you have invites now, include it here:
  // group_invites,
} from "./schema";

type AuthUser = {
  id: string;
  email?: string;
};

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/**
 * Find an Auth user by email using Admin listUsers pagination.
 * Supabase JS doesn't always provide "getUserByEmail", so we scan pages.
 */
async function findAuthUserByEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string
): Promise<AuthUser | null> {
  const perPage = 200;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const user = data?.users?.find(
      (u) => (u.email ?? "").toLowerCase() === email.toLowerCase()
    );

    if (user) return { id: user.id, email: user.email ?? undefined };

    // If less than perPage, we're at the end.
    if (!data?.users || data.users.length < perPage) break;
  }

  return null;
}

/**
 * Ensure an Auth user exists for `email` and has `password` set.
 * - If user doesn't exist: create it (and confirm email for dev convenience).
 * - If user exists: update password.
 */
async function ensureAuthUser(email: string, password: string): Promise<AuthUser> {
  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SERVICE_ROLE_KEY");

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const existing = await findAuthUserByEmail(supabaseAdmin, email);

  if (!existing) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      // For dev: lets you sign in immediately without inbox confirmation
      email_confirm: true,
    });
    if (error) throw error;

    if (!data.user?.id) throw new Error("Auth user creation succeeded but no user id returned.");
    return { id: data.user.id, email: data.user.email ?? email };
  }

  // User exists → update password
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
    password,
  });
  if (error) throw error;

  return { id: data.user?.id ?? existing.id, email: data.user?.email ?? existing.email ?? email };
}

async function seed() {
  // -------------------------
  // 1) CLEANUP (reverse dependency order)
  // -------------------------
  // NOTE: This does not touch auth.users (Supabase Auth).
  await db.execute(sql`DELETE FROM ${expense_shares}`);
  await db.execute(sql`DELETE FROM ${expenses}`);
  await db.execute(sql`DELETE FROM ${posts}`);
  await db.execute(sql`DELETE FROM ${otpChallenges}`);

  // If you added group_invites:
  // await db.execute(sql`DELETE FROM ${group_invites}`);

  await db.execute(sql`DELETE FROM ${members}`);
  await db.execute(sql`DELETE FROM ${groups}`);

  // If you want a clean profile table for dev, you can delete it too.
  // We'll upsert the seed user right after, so it's safe.
  await db.execute(sql`DELETE FROM ${users}`);

  console.log("🧹 Cleanup done.");

  // -------------------------
  // 2) Ensure Supabase Auth user exists + password is set
  // -------------------------
  const email = (process.env.SEED_USER_EMAIL || "antonraphaelcaballes@gmail.com")
    .trim()
    .toLowerCase();

  const password = (process.env.SEED_USER_PASSWORD || "Pass123!.").trim();

  // This is the REAL login credential setup (auth.users)
  const authUser = await ensureAuthUser(email, password);
  const userId = authUser.id;

  console.log(`🔐 Auth user ready: ${email} (${userId})`);

  // -------------------------
  // 3) Upsert profile row in public.users (app profile table)
  // -------------------------
  // Your trigger may also create this row on signup, but we upsert to be sure.
  await db
    .insert(users)
    .values([
      {
        id: userId,
        email,
        username: "anton",
        role: "user",
        password: "", // ✅ not used for Auth; keep empty or remove this column later
      },
    ])
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        username: "anton",
        role: "user",
        password: "",
      },
    });

  // -------------------------
  // 4) Seed 1 group
  // -------------------------
  const [group] = await db
    .insert(groups)
    .values([
      {
        id: randomUUID(),
        name: "My Group",
        created_by: userId,
        active: true,
      },
    ])
    .returning();

  // -------------------------
  // 5) Seed 1 member (you)
  // -------------------------
  await db.insert(members).values([
    {
      id: randomUUID(),
      group_id: group.id,
      user_id: userId,
      email,
      first_name: "Anton",
      last_name: "Caballes",
    },
  ]);

  console.log("✅ Seed complete:");
  console.log(`   - login email: ${email}`);
  console.log(`   - login password: ${password}`);
  console.log(`   - auth/profile user id: ${userId}`);
  console.log(`   - group: ${group.name} (${group.id})`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
