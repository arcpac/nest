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
  .metadata({ actionName: 'addGroup' })
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
    const userID = (ctx as any).user.id
    const userEmail = (ctx as any).user.email

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
        created_by: userID
      })
      .returning();

    await db.insert(members).values({
      user_id: userID,
      group_id: newGroup.id,
      email: userEmail,
    });

    return {
      isSuccess: true,
      message: "Group successfully created",
      groupId: newGroup.id,
    };
  });
