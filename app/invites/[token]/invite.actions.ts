"use server";

import { z } from "zod";
import { protectedAction } from "@/lib/safe-action";
import { db } from "@/db";
import { groupInvites, members, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getInviteByToken } from "./invite.queries";

const acceptInviteSchema = z.object({
    token: z.string().min(10),
});

export const acceptInvite = protectedAction
    .metadata({ actionName: "acceptInvite" })
    .inputSchema(acceptInviteSchema)
    .action(async ({ parsedInput: { token }, ctx }) => {
        const authedUserId = (ctx as any).user.id; // adjust if your ctx is typed
        const authedEmail = ((ctx as any).user.email ?? "").toLowerCase();

        // Validate invite exists + pending + not expired
        const inviteRes = await getInviteByToken(token);
        if (!inviteRes.ok) {
            return {
                isSuccess: false,
                type: "invite-invalid" as const,
                reason: inviteRes.reason,
                message:
                    inviteRes.reason === "expired"
                        ? "Invite has expired."
                        : inviteRes.reason === "already_used"
                            ? "Invite has already been used."
                            : "Invite not found.",
            };
        }
        console.log('inviteRes: ', inviteRes)
        const invite = inviteRes.invite;

        console.log('invite.email.toLowerCase() ', invite.email.toLowerCase())
        console.log('authedEmail ', authedEmail)
        console.log('authUserId ', authedUserId)

        // Must match the invited email (for non-existing users invited by email)
        if (invite.email.toLowerCase() !== authedEmail) {
            console.log('you are in')
            return {
                isSuccess: false,
                type: "wrong-account" as const,
                message: `This invite is for ${invite.email}, but you are logged in as ${authedEmail}.`,
                invitedEmail: invite.email,
                loggedInEmail: authedEmail,
            };
        }
        console.log('up to here ----')
        // Get profile fields if you want to store name in members
        const [profile] = await db
            .select({
                id: users.id,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, authedUserId))
            .limit(1);
        console.log('Profile: ', profile)
        // Transaction: insert member + mark invite accepted
        await db.transaction(async (tx) => {
            // Insert membership (use your real columns; keep it minimal if needed)
            await tx
                .insert(members)
                .values({
                    group_id: invite.groupId,
                    user_id: authedUserId,
                    email: profile?.email ?? authedEmail,
                } as any)
                .onConflictDoNothing();

            await tx
                .update(groupInvites)
                .set({ status: "accepted", accepted_at: new Date() } as any)
                .where(eq(groupInvites.id, invite.id));
        });

        return {
            isSuccess: true,
            type: "accepted" as const,
            message: "Invite accepted! Welcome to the group.",
            groupId: invite.groupId,
        };
    });
