import { households } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getAllHouseholds() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return db.select().from(households);
}

export async function getHouseholdId(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
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
