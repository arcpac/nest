"use server";

import { db } from "@/db";
import { households, members } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionClient, protectedAction } from "@/lib/safe-action";
import { eq } from "drizzle-orm";

const CreateHouseholdSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
});

export const createHousehold = protectedAction
  .inputSchema(CreateHouseholdSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existingHousehold = await db.query.household.findFirst({
      where: eq(households.name, parsedInput.name),
    });

    if (existingHousehold) return { error: true, message: "Name is existing." };

    const result = await db.insert(households).values({
      name: parsedInput.name,
      created_by: ctx.session.user.id,
    });

    console.log("result", result);

    revalidatePath("/dashboard");

    return { success: true } as const;
  });

export const getMembers = protectedAction
  .inputSchema(
    z.object({
      id: z.string(),
    })
  )
  .action(async ({ parsedInput }) => {
    const result = await db
      .select()
      .from(members)
      .where(eq(members.household_id, parsedInput.id));

    return { success: true, data: result } as const;
  });
