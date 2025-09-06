"use server";

import { db } from "@/db";
import { households } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function createHousehold({ name }: { name: string }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  await db.insert(households).values({
    name,
    created_by: session.user.id,
  });

  revalidatePath("/dashboard");

  return { success: true };
}
