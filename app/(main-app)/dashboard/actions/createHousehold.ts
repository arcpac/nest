"use server";

import { db } from "@/db";
import { households } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function createHousehold() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const randomName = `Test Household ${Math.floor(Math.random() * 10000)}`;

  await db.insert(households).values({
    name: randomName,
    created_by: session.user.id,

  });

  // Optional: trigger page refresh
  revalidatePath("/dashboard");
}
