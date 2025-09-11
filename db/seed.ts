// scripts/seed.ts
import { sql } from "drizzle-orm";
import { db } from "./db";
import { households, users, members } from "./schema";

async function seed() {
  // Clear tables (reverse dependency order!)
  await db.execute(sql`DELETE FROM ${members}`);
  await db.execute(sql`DELETE FROM ${households}`);
  await db.execute(sql`DELETE FROM ${users}`);

  // Seed users
  await db.insert(users).values([
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Anton",
      email: "anton@example.com",
      password: "Pass123!.",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Alpha",
      email: "alpha@example.com",
      password: "Pass123!.",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Beta",
      email: "beta@example.com",
      password: "Pass123!.",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      name: "Charlie",
      email: "charlie@example.com",
      password: "Pass123!.",
    },
  ]);

  // Seed households
  const householdResult = await db
    .insert(households)
    .values([
      {
        id: "10000000-0000-0000-0000-000000000001",
        name: "My Apartment",
        active: true,
        created_by: "00000000-0000-0000-0000-000000000001",
      },
      {
        id: "10000000-0000-0000-0000-000000000002",
        name: "Parents Home",
        active: true,
        created_by: "00000000-0000-0000-0000-000000000001",
      },
    ])
    .returning();

  // Seed members
  await db.insert(members).values([
    {
      id: "20000000-0000-0000-0000-000000000001",
      household_id: "10000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000001",
      email: "anton@example.com",
      first_name: "Anton",
      last_name: "Caballes",
      role: "owner",
    },
    {
      id: "20000000-0000-0000-0000-000000000002",
      household_id: "10000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000002",
      email: "beta@example.com",
      first_name: "Beta",
      last_name: "userBeta",
      role: "member",
    },
    {
      id: "20000000-0000-0000-0000-000000000003",
      household_id: "10000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000003",
      email: "charlie@example.com",
      first_name: "Charlie",
      last_name: "userCharlie",
      role: "member",
    },
  ]);

  console.log("✅ Seeded households and members");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
