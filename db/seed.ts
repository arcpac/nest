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
import bcrypt from "bcryptjs";

async function seed() {
  // Clear tables (reverse dependency order!)
  await db.execute(sql`DELETE FROM ${expense_shares}`);
  await db.execute(sql`DELETE FROM ${expenses}`);
  await db.execute(sql`DELETE FROM ${posts}`);
  await db.execute(sql`DELETE FROM ${members}`);
  await db.execute(sql`DELETE FROM ${groups}`);
  await db.execute(sql`DELETE FROM ${users}`);

  // Seed users

  const seededUsers = await db
    .insert(users)
    .values([
      {
        id: randomUUID(),
        username: "anton",
        role: "admin",
        email: "anton@example.com",
        password: await bcrypt.hash("Pass123!.", 10),
      },
      {
        id: randomUUID(),
        username: "beta",
        role: "user",
        email: "beta@example.com",
        password: await bcrypt.hash("Pass123!.", 10),
      },
      {
        id: randomUUID(),
        username: "charlie",
        role: "user",
        email: "charlie@example.com",
        password: await bcrypt.hash("Pass123!.", 10),
      },
    ])
    .returning();

  const [user, betaUser, charlieUser] = seededUsers;

  // Seed groups
  const [group] = await db
    .insert(groups)
    .values([
      {
        id: randomUUID(),
        name: "My Apartment",
        created_by: user.id,
        active: true,
      },
    ])
    .returning();

  // Seed members
  const seededMembers = await db
    .insert(members)
    .values([
      {
        id: randomUUID(),
        first_name: "anton",
        last_name: "cab",
        group_id: group.id,
        user_id: user.id,
        email: user.email,
      },
      {
        id: randomUUID(),
        first_name: "beta",
        last_name: "ateb",
        group_id: group.id,
        user_id: betaUser.id, // for beta@example.com
        email: betaUser.email,
      },
      {
        id: randomUUID(),
        group_id: group.id,
        user_id: charlieUser.id, // for charlie@example.com
        email: charlieUser.email,
      },
    ])
    .returning();

  const [member1, member2, member3] = seededMembers;

  const seededExpenses = await db
    .insert(expenses)
    .values([
      {
        id: randomUUID(),
        title: "Grocery Shopping",
        amount: "120.50",
        description: "Weekly groceries for the apartment",
        created_by: user.id, // use the actual user ID
        group_id: group.id, // use the actual group ID
      },
      {
        id: randomUUID(),
        title: "Electricity Bill",
        amount: "85.30",
        description: "Monthly electricity bill",
        created_by: user.id, // use the actual user ID
        group_id: group.id, // use the actual group ID
      },
    ])
    .returning();

  const [expense1, expense2] = seededExpenses;

  // // Seed expense shares

  await db.insert(expense_shares).values({
    expense_id: expense1.id,
    member_id: member1.id,
    share: "50.00",
    paid: false,
  });

  await db.insert(expense_shares).values({
    expense_id: expense1.id,
    member_id: member2.id,
    share: "50.00",
    paid: false,
  });

  // // Seed posts
  // await db.insert(posts).values([
  //   {
  //     title: "Welcome to our group!",
  //     body: "This is our first post in the apartment group. Let's keep track of our expenses and communicate here.",
  //     user_id: "00000000-0000-0000-0000-000000000001",
  //     group_id: "10000000-0000-0000-0000-000000000001",
  //     status: "published",
  //   },
  //   {
  //     title: "Monthly Budget Meeting",
  //     body: "Let's schedule a meeting to discuss our monthly budget and upcoming expenses.",
  //     user_id: "00000000-0000-0000-0000-000000000001",
  //     group_id: "10000000-0000-0000-0000-000000000001",
  //     status: "draft",
  //   },
  // ]);

  console.log("✅ Seeded all tables successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
