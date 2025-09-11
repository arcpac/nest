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
    .select({ id: members.id, household_id: members.household_id })
    .from(members)
    .where(eq(members.household_id, id))
    .then((res) => res[0]);

  return houseMembers;
}
