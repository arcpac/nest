// scripts/seed.ts
import { sql } from "drizzle-orm";
import { db } from "./db";
import {
  groups,
  users,
  members,
  expenses,
  expense_shares,
  posts,
} from "./schema";
import { randomUUID } from "crypto";

async function seed() {
  // Clear tables (reverse dependency order!)
  await db.execute(sql`DELETE FROM ${expense_shares}`);
  await db.execute(sql`DELETE FROM ${expenses}`);
  await db.execute(sql`DELETE FROM ${posts}`);
  await db.execute(sql`DELETE FROM ${members}`);
  await db.execute(sql`DELETE FROM ${groups}`);
  await db.execute(sql`DELETE FROM ${users}`);

  // Seed users
  await db.insert(users).values([
    {
      id: randomUUID(),
      username: "anton",
      role: "admin",
      email: "anton@example.com",
      password: "Pass123!.",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      username: "alpha",
      role: "user",
      email: "alpha@example.com",
      password: "Pass123!.",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      username: "beta",
      role: "user",
      email: "beta@example.com",
      password: "Pass123!.",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      username: "charlie",
      role: "user",
      email: "charlie@example.com",
      password: "Pass123!.",
    },
  ]);

  // Seed groups
  const groupResult = await db
    .insert(groups)
    .values([
      {
        id: "10000000-0000-0000-0000-000000000001",
        name: "My Apartment",
        created_by: "00000000-0000-0000-0000-000000000001",
      },
      {
        id: "10000000-0000-0000-0000-000000000002",
        name: "Parents Home",
        created_by: "00000000-0000-0000-0000-000000000001",
      },
    ])
    .returning();

  // Seed members
  const memberResult = await db
    .insert(members)
    .values([
      {
        id: "20000000-0000-0000-0000-000000000001",
        group_id: "10000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000001",
        email: "anton@example.com",
      },
      {
        id: "20000000-0000-0000-0000-000000000002",
        group_id: "10000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000002",
        email: "beta@example.com",
      },
      {
        id: "20000000-0000-0000-0000-000000000003",
        group_id: "10000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000003",
        email: "charlie@example.com",
      },
    ])
    .returning();

  // Seed expenses
  const expenseResult = await db
    .insert(expenses)
    .values([
      {
        id: "30000000-0000-0000-0000-000000000001",
        title: "Grocery Shopping",
        amount: "120.50",
        description: "Weekly groceries for the apartment",
        created_by: "00000000-0000-0000-0000-000000000001",
        group_id: "10000000-0000-0000-0000-000000000001",
      },
      {
        id: "30000000-0000-0000-0000-000000000002",
        title: "Electricity Bill",
        amount: "85.30",
        description: "Monthly electricity bill",
        created_by: "00000000-0000-0000-0000-000000000001",
        group_id: "10000000-0000-0000-0000-000000000001",
      },
    ])
    .returning();

  // Seed expense shares
  await db.insert(expense_shares).values([
    {
      id: "40000000-0000-0000-0000-000000000001",
      expense_id: "30000000-0000-0000-0000-000000000001",
      member_id: "20000000-0000-0000-0000-000000000001",
      share: "40.17",
      paid: false,
    },
    {
      id: "40000000-0000-0000-0000-000000000002",
      expense_id: "30000000-0000-0000-0000-000000000001",
      member_id: "20000000-0000-0000-0000-000000000002",
      share: "40.17",
      paid: true,
    },
    {
      id: "40000000-0000-0000-0000-000000000003",
      expense_id: "30000000-0000-0000-0000-000000000001",
      member_id: "20000000-0000-0000-0000-000000000003",
      share: "40.16",
      paid: false,
    },
    {
      id: "40000000-0000-0000-0000-000000000004",
      expense_id: "30000000-0000-0000-0000-000000000002",
      member_id: "20000000-0000-0000-0000-000000000001",
      share: "28.43",
      paid: false,
    },
    {
      id: "40000000-0000-0000-0000-000000000005",
      expense_id: "30000000-0000-0000-0000-000000000002",
      member_id: "20000000-0000-0000-0000-000000000002",
      share: "28.43",
      paid: false,
    },
    {
      id: "40000000-0000-0000-0000-000000000006",
      expense_id: "30000000-0000-0000-0000-000000000002",
      member_id: "20000000-0000-0000-0000-000000000003",
      share: "28.44",
      paid: true,
    },
  ]);

  // Seed posts
  await db.insert(posts).values([
    {
      title: "Welcome to our group!",
      body: "This is our first post in the apartment group. Let's keep track of our expenses and communicate here.",
      user_id: "00000000-0000-0000-0000-000000000001",
      group_id: "10000000-0000-0000-0000-000000000001",
      status: "published",
    },
    {
      title: "Monthly Budget Meeting",
      body: "Let's schedule a meeting to discuss our monthly budget and upcoming expenses.",
      user_id: "00000000-0000-0000-0000-000000000001",
      group_id: "10000000-0000-0000-0000-000000000001",
      status: "draft",
    },
  ]);

  console.log("✅ Seeded all tables successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
