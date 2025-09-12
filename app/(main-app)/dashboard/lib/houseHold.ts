import { households, members } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getAllHouseholds() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return db.select().from(households);
}

export async function getHouseholdId(id: string) {
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  const household = await db
    .select({
      id: households.id,
      name: households.name,
      active: households.active,
    })
    .from(households)
    .where(eq(households.id, id))
    .limit(1)
    .then((res) => res[0]);

  return household;
}

export async function getHouseholdMembers(id: string) {
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  const houseMembers = await db
    .select({
      id: members.id,
      first_name: members.first_name,
      last_name: members.last_name,
      email: members.email,
      household_id: members.household_id,
      joined_at: members.joined_at,
    })
    .from(members)
    .where(eq(members.household_id, id))
    .then((res) => res);

  return houseMembers.map((member) => ({
    ...member,
    joined_at: member.joined_at ? member.joined_at.toISOString() : null,
  }));
}
