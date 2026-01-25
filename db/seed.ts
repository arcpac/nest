// scripts/seed.ts
import { sql } from "drizzle-orm";
import { db } from "./db";
import { groups, users, members, expenses, expense_shares, posts, otpChallenges } from "./schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

function toCents(n: number) {
  return Math.round(n * 100);
}
function fromCents(c: number) {
  return (c / 100).toFixed(2);
}

async function seed() {
  // ✅ Clear tables (reverse dependency order)
  await db.execute(sql`DELETE FROM ${expense_shares}`);
  await db.execute(sql`DELETE FROM ${expenses}`);
  await db.execute(sql`DELETE FROM ${posts}`);
  await db.execute(sql`DELETE FROM ${members}`);
  await db.execute(sql`DELETE FROM ${groups}`);
  await db.execute(sql`DELETE FROM ${otpChallenges}`); // safest before users (depends on your schema)
  await db.execute(sql`DELETE FROM ${users}`);

  // --- USERS ---
  const passwordHash = await bcrypt.hash("Pass123!.", 10);

  const newUsers = [
    {
      id: randomUUID(),
      username: "admin",
      role: "user", // change to "admin" if your app supports it
      email: "admin@example.com",
      password: passwordHash,
    },
    ...Array.from({ length: 6 }).map(() => ({
      id: randomUUID(),
      username: faker.internet.username(),
      role: "user",
      email: faker.internet.email(),
      password: passwordHash,
    })),
  ];

  const seededUsers = await db.insert(users).values(newUsers).returning();
  const [user1, user2, user3, user4, user5, user6, user7] = seededUsers;

  // --- GROUPS ---
  const seededGroups = await db
    .insert(groups)
    .values([
      { id: randomUUID(), name: "Roommates", created_by: user1.id, active: true },
      { id: randomUUID(), name: "Weekend Trip", created_by: user2.id, active: true },
      { id: randomUUID(), name: "Family Bills", created_by: user3.id, active: true },
    ])
    .returning();

  const [group1, group2, group3] = seededGroups;

  // --- MEMBERS (make every group usable) ---
  // Ensure: creators are members + groups have multiple members
  const memberValues = [
    // group1
    { id: randomUUID(), group_id: group1.id, user_id: user1.id, email: user1.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },
    { id: randomUUID(), group_id: group1.id, user_id: user2.id, email: user2.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },
    { id: randomUUID(), group_id: group1.id, user_id: user4.id, email: user4.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },

    // group2
    { id: randomUUID(), group_id: group2.id, user_id: user2.id, email: user2.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },
    { id: randomUUID(), group_id: group2.id, user_id: user3.id, email: user3.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },
    { id: randomUUID(), group_id: group2.id, user_id: user5.id, email: user5.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },

    // group3
    { id: randomUUID(), group_id: group3.id, user_id: user3.id, email: user3.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },
    { id: randomUUID(), group_id: group3.id, user_id: user6.id, email: user6.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },
    { id: randomUUID(), group_id: group3.id, user_id: user7.id, email: user7.email, first_name: faker.person.firstName(), last_name: faker.person.lastName() },
  ];

  const seededMembers = await db.insert(members).values(memberValues).returning();

  // Helper: groupId -> member rows
  const membersByGroup = seededMembers.reduce<Record<string, typeof seededMembers>>((acc, m) => {
    acc[m.group_id] ??= [];
    acc[m.group_id].push(m);
    return acc;
  }, {});

  // --- EXPENSES + SHARES ---
  const allGroups = [group1, group2, group3];

  // create 18 expenses across groups
  for (let i = 0; i < 18; i++) {
    const g = allGroups[i % allGroups.length];
    const groupMembers = membersByGroup[g.id];

    // choose a creator from *members of that group* (more realistic)
    const creatorMember = faker.helpers.arrayElement(groupMembers);
    const creatorUserId = creatorMember.user_id;

    // generate amount as number then store as "xx.xx" string
    const amountNum = faker.number.float({ min: 10, max: 250, fractionDigits: 2 });
    const amount = amountNum.toFixed(2);

    const [expense] = await db
      .insert(expenses)
      .values({
        id: randomUUID(),
        title: faker.commerce.productName(),
        amount, // numeric column; drizzle/pg often accepts string
        description: faker.commerce.productDescription(),
        created_by: creatorUserId,
        group_id: g.id,
        isEqual: true,
      })
      .returning();

    // Equal split across members (in cents, to avoid rounding issues)
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
        paid: faker.datatype.boolean({ probability: 0.35 }), // 35% randomly paid
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
