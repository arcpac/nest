// scripts/seed.ts
// NOTE: With Supabase Auth, do NOT seed auth.users here.
// This script seeds app data (groups/members/expenses/shares) around one or more
// existing Supabase Auth users.

import { sql } from "drizzle-orm";
import { db } from "./db";
import {
  groups,
  users,
  members,
  expenses,
  expense_shares,
  posts,
  otpChallenges,
} from "./schema";
import { randomUUID } from "crypto";
import { faker } from "@faker-js/faker";

function toCents(n: number) {
  return Math.round(n * 100);
}
function fromCents(c: number) {
  return (c / 100).toFixed(2);
}

async function seed() {
  // ✅ Clear app tables (reverse dependency order)
  // IMPORTANT: We do NOT delete from public.users in a Supabase Auth setup.
  await db.execute(sql`DELETE FROM ${expense_shares}`);
  await db.execute(sql`DELETE FROM ${expenses}`);
  await db.execute(sql`DELETE FROM ${posts}`);
  await db.execute(sql`DELETE FROM ${members}`);
  await db.execute(sql`DELETE FROM ${groups}`);
  await db.execute(sql`DELETE FROM ${otpChallenges}`);

  // --- USERS (profiles only) ---
  // Provide existing Auth user IDs via env:
  //   SEED_USER_IDS="uuid1,uuid2,uuid3"
  // Optionally:
  //   SEED_USER_EMAILS="a@x.com,b@x.com,c@x.com" (same count/order)
  const rawIds = process.env.SEED_USER_IDS?.trim();
  if (!rawIds) {
    throw new Error(
      "Missing SEED_USER_IDS. Add e.g. SEED_USER_IDS=ecaf0a31-... to .env.local"
    );
  }

  const seedUserIds = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const seedEmails = (process.env.SEED_USER_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Ensure profile rows exist (idempotent)
  // NOTE: password is intentionally blank; Supabase Auth owns passwords.
  const profileRows = seedUserIds.map((id, idx) => {
    const email = seedEmails[idx] || `seed${idx + 1}@example.com`;
    return {
      id,
      email,
      username: `seed_user_${idx + 1}`,
      role: "user",
      password: "", // consider dropping this column later
    };
  });

  // Insert profiles if missing. If your Drizzle version supports onConflictDoNothing, use it.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await db.insert(users).values(profileRows).onConflictDoNothing();

  // For convenience below
  const seededUsers = profileRows.map((u) => ({ id: u.id, email: u.email }));
  const pickUser = (i: number) => seededUsers[i % seededUsers.length];

  // --- GROUPS ---
  const seededGroups = await db
    .insert(groups)
    .values([
      { id: randomUUID(), name: "Roommates", created_by: pickUser(0).id, active: true },
      { id: randomUUID(), name: "Weekend Trip", created_by: pickUser(1).id, active: true },
      { id: randomUUID(), name: "Family Bills", created_by: pickUser(2).id, active: true },
    ])
    .returning();

  const [group1, group2, group3] = seededGroups;

  // --- MEMBERS (make every group usable) ---
  // Ensure: creators are members + groups have multiple members.
  // If you only provide 1-2 SEED_USER_IDS, we will avoid creating duplicate
  // memberships that violate unique(user_id, group_id).
  const uniqueUsers = (count: number) => {
    const out: { id: string; email: string }[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < seededUsers.length && out.length < count; i++) {
      const u = pickUser(i);
      if (seen.has(u.id)) continue;
      seen.add(u.id);
      out.push(u);
    }
    return out;
  };

  const group1Users = uniqueUsers(3);
  const group2Users = uniqueUsers(3);
  const group3Users = uniqueUsers(3);

  const memberValues = [
    ...group1Users.map((u) => ({
      id: randomUUID(),
      group_id: group1.id,
      user_id: u.id,
      email: u.email,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
    })),
    ...group2Users.map((u) => ({
      id: randomUUID(),
      group_id: group2.id,
      user_id: u.id,
      email: u.email,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
    })),
    ...group3Users.map((u) => ({
      id: randomUUID(),
      group_id: group3.id,
      user_id: u.id,
      email: u.email,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
    })),
  ];

  const seededMembers = await db.insert(members).values(memberValues).returning();

  // Helper: groupId -> member rows
  const membersByGroup = seededMembers.reduce<Record<string, typeof seededMembers>>(
    (acc, m) => {
      acc[m.group_id] ??= [];
      acc[m.group_id].push(m);
      return acc;
    },
    {}
  );

  // --- EXPENSES + SHARES ---
  const allGroups = [group1, group2, group3];

  // create 18 expenses across groups
  for (let i = 0; i < 18; i++) {
    const g = allGroups[i % allGroups.length];
    const groupMembers = membersByGroup[g.id];

    const creatorMember = faker.helpers.arrayElement(groupMembers);
    const creatorUserId = creatorMember.user_id;

    const amountNum = faker.number.float({ min: 10, max: 250, fractionDigits: 2 });
    const amount = amountNum.toFixed(2);

    const [expense] = await db
      .insert(expenses)
      .values({
        id: randomUUID(),
        title: faker.commerce.productName(),
        amount,
        description: faker.commerce.productDescription(),
        created_by: creatorUserId,
        group_id: g.id,
        isEqual: true,
      })
      .returning();

    const totalCents = toCents(amountNum);
    const base = Math.floor(totalCents / groupMembers.length);
    const remainder = totalCents - base * groupMembers.length;

    const shareRows = groupMembers.map((m, idx) => {
      const cents = base + (idx < remainder ? 1 : 0);
      return {
        id: randomUUID(),
        expense_id: expense.id,
        member_id: m.id,
        share: fromCents(cents),
        paid: faker.datatype.boolean({ probability: 0.35 }),
      };
    });

    await db.insert(expense_shares).values(shareRows);
  }

  console.log("✅ Seeding completed successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
