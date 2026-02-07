"use server";

import { z } from "zod";
import { flattenValidationErrors } from "next-safe-action";
import { protectedAction } from "@/lib/safe-action";
import { db } from "@/db";
import { members, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

const addMemberSchema = z.object({
    groupId: z.string().min(1),
    email: z.email(),
});

export const addMember = protectedAction
    .metadata({ actionName: 'addGroupMember' })
    .inputSchema(addMemberSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: { groupId, email } }) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            return {
                isSuccess: false,
                message: "Email is required",
            };
        }

        const [user] = await db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

        if (!user) {
            return {
                isSuccess: true,
                message: "User invited",
            };
        }

        const [existingMember] = await db
            .select({ id: members.id })
            .from(members)
            .where(and(eq(members.group_id, groupId), eq(members.user_id, user.id)))
            .limit(1);

        if (!existingMember) {
            await db.insert(members).values({
                user_id: user.id,
                group_id: groupId,
                email: user.email,
            });
        }

        return {
            isSuccess: true,
            message: "User invited",
        };
    });
