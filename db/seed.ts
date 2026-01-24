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
  otpChallenges,
} from "./schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

async function seed() {
  // Clear tables (reverse dependency order!)
  await db.execute(sql`DELETE FROM ${expense_shares}`);
  await db.execute(sql`DELETE FROM ${expenses}`);
  await db.execute(sql`DELETE FROM ${posts}`);
  await db.execute(sql`DELETE FROM ${members}`);
  await db.execute(sql`DELETE FROM ${groups}`);
  await db.execute(sql`DELETE FROM ${users}`);
  await db.execute(sql`DELETE FROM ${otpChallenges}`);

  async function generateRandomUsers(count: number) {
    const result = [];
    result.push({
      id: randomUUID(),
      username: "admin",
      role: "user",
      email: "admin@example.com",
      password: await bcrypt.hash("Pass123!.", 10),
    });
    for (let i = 0; i < count; i++) {
      result.push({
        id: randomUUID(),
        username: faker.internet.username(),
        role: "user",
        email: faker.internet.email(),
        password: await bcrypt.hash("Pass123!.", 10),
      });
    }
    return result;
  }

  async function seedUsers() {
    await db.execute(sql`DELETE FROM ${expense_shares}`);
    await db.execute(sql`DELETE FROM ${expenses}`);
    await db.execute(sql`DELETE FROM ${posts}`);
    await db.execute(sql`DELETE FROM ${members}`);
    await db.execute(sql`DELETE FROM ${groups}`);
    await db.execute(sql`DELETE FROM ${users}`);
    // create 8 users
    const newUsers = await generateRandomUsers(3);

    const seededUsers = await db.insert(users).values(newUsers).returning();
    const [user1, user2, user3, user4] = seededUsers;

    // create groups for those users
    const seededGroups = await db
      .insert(groups)
      .values([
        {
          id: randomUUID(),
          name: faker.company.name(), // 👈 more realistic than bicycle
          created_by: user1.id,
          active: true,
        },
        {
          id: randomUUID(),
          name: faker.company.name(),
          created_by: user1.id,
          active: true,
        },
        {
          id: randomUUID(),
          name: faker.company.name(),
          created_by: user2.id,
          active: true,
        },
      ])
      .returning();

    const [group1, group2, group3] = seededGroups;

    const seededMembers = await db
      .insert(members)
      .values([
        {
          id: randomUUID(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          group_id: group1.id,
          user_id: user1.id,
          email: user1.email,
        },
        {
          id: randomUUID(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          group_id: group1.id,
          user_id: user2.id,
          email: user2.email,
        },
        {
          id: randomUUID(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          group_id: group2.id,
          user_id: user3.id,
          email: user3.email,
        },
      ])
      .returning();

    const seededMembersToGroupProjects = await db
      .insert(members)
      .values([
        {
          id: randomUUID(),
          first_name: "anton",
          last_name: "cab",
          group_id: group2.id,
          user_id: user1.id,
          email: user1.email,
        },
        {
          id: randomUUID(),
          first_name: "anton",
          last_name: "cab",
          group_id: group3.id,
          user_id: user2.id,
          email: user2.email,
        },
      ])
      .returning();

    const [member1, member2, member3] = seededMembers;

    // Create 10 expenses with mixed creators: admin (user1) and user2
    const possibleCreators = [user1.id, user2.id];
    const expenseValues = Array.from({ length: 10 }).map(() => ({
      id: randomUUID(),
      title: faker.person.fullName(),
      amount: faker.commerce.price({ min: 5, max: 200, dec: 2 }),
      description: faker.lorem.sentence(),
      created_by:
        possibleCreators[Math.floor(Math.random() * possibleCreators.length)],
      group_id: group1.id,
    }));

    await db.insert(expenses).values(expenseValues).returning();
  }

  await seedUsers();
  console.log("✅ Seeding completed successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});
