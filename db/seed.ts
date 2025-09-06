// scripts/seed.ts
import { sql } from "drizzle-orm";
import { db } from "./db";
import { households, users } from "./schema";

async function seed() {
  await db.execute(sql`DELETE FROM ${households}`);

  // user
  await db.insert(users).values([
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Anton",
      email: "anton@example.com",
      password:"Pass123!."
    },
  ]);

  // household
  await db.insert(households).values([
    {
      name: "My Apartment",
      created_by: "00000000-0000-0000-0000-000000000001",
    },
    {
      name: "Parents Home",
      created_by: "00000000-0000-0000-0000-000000000001",
    },
  ]);

  console.log("✅ Seeded households");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
