"use server";

import { z } from "zod";
import { flattenValidationErrors } from "next-safe-action";
import { protectedAction } from "@/lib/safe-action";
import { db } from "@/db";
import { groups, members } from "@/db/schema";

const groupSchema = z.object({
  name: z.string().min(1).max(80),
  active: z.boolean().optional(),
});

export const createGroup = protectedAction
  .inputSchema(groupSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(async ({ parsedInput: { name, active }, ctx }) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return {
        isSuccess: false,
        message: "Group name is required",
      };
    }

    const userEmail = ctx.user.email ?? "";
    if (!userEmail) {
      return {
        isSuccess: false,
        message: "User email not found",
      };
    }

    const [newGroup] = await db
      .insert(groups)
      .values({
        name: trimmedName,
        active: active ?? true,
        created_by: ctx.user.id,
      })
      .returning();

    await db.insert(members).values({
      user_id: ctx.user.id,
      group_id: newGroup.id,
      email: userEmail,
    });

    return {
      isSuccess: true,
      message: "Group successfully created",
      groupId: newGroup.id,
    };
  });
