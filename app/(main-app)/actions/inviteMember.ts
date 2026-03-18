"use server";

import { z } from "zod";
import { flattenValidationErrors } from "next-safe-action";
import { protectedAction } from "@/lib/safe-action";
import { db } from "@/db";
import { groupInvites, members, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";
import { sendInviteEmail } from "@/lib/mailer";

const inviteMemberSchema = z.object({
    groupId: z.string().min(1),
    email: z.string().email(),
});

export const inviteMember = protectedAction
    .metadata({ actionName: "inviteMember" })
    .inputSchema(inviteMemberSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: { groupId, email }, ctx }) => {
        const inviterUserId = (ctx as any).user.id;
        const normalizedEmail = email.trim().toLowerCase();

        const [user] = await db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

        if (user) {
            const [existingMember] = await db
                .select({ id: members.id })
                .from(members)
                .where(and(eq(members.group_id, groupId), eq(members.user_id, user.id)))
                .limit(1);

            if (existingMember) {
                return {
                    isSuccess: true,
                    message: "User is already a member of this group.",
                };
            }
        }

        // 3) Create or refresh an invite
        const token = crypto.randomBytes(24).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.APP_URL ||
            "http://localhost:3000";

        const inviteLink = `${baseUrl}/invites/${token}`;
        console.log("INVITE LINK:", inviteLink);

        await db
            .insert(groupInvites)
            .values({
                group_id: groupId,
                email: normalizedEmail,
                invited_user_id: user?.id ?? null,
                invited_by: inviterUserId,
                token,
                status: "pending",
                expires_at: expiresAt,
            })
            .onConflictDoUpdate({
                target: [groupInvites.group_id, groupInvites.email],
                set: {
                    invited_user_id: user?.id ?? null,
                    invited_by: inviterUserId,
                    token,
                    status: "pending",
                    expires_at: expiresAt,
                    accepted_at: null,
                },
            });

        try {
            await sendInviteEmail({
                to: normalizedEmail,
                inviteLink,
                inviterEmail: (ctx as any).user?.email,
            });
        } catch (e) {
            console.error("Failed to send invite email:", e);
            return {
                isSuccess: false,
                type: "send-invite" as const,
                message: "Invite created but email failed to send.",
                groupId,
                email: normalizedEmail,
            };
        }

        return { isSuccess: true, type: "invite-sent" as const, message: "Invite sent." };
    });

const resendInviteSchema = z.object({
    groupId: z.string().min(1),
    email: z.string().email(),
});

export const resendInvite = protectedAction
    .metadata({ actionName: "resendInvite" })
    .inputSchema(resendInviteSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: { groupId, email }, ctx }) => {
        const normalizedEmail = email.trim().toLowerCase();

        const [invite] = await db
            .select({
                token: groupInvites.token,
                status: groupInvites.status,
                expires_at: groupInvites.expires_at,
            })
            .from(groupInvites)
            .where(
                and(eq(groupInvites.group_id, groupId), eq(groupInvites.email, normalizedEmail))
            )
            .limit(1);

        // accepted case
        if (!invite || invite.status === "accepted") {
            return {
                isSuccess: false,
                type: "send-invite" as const,
                message: "Please invite again.",
            };
        }
        // expired case
        if (invite.expires_at && invite.expires_at < new Date()) {
            return {
                isSuccess: false,
                type: "send-invite" as const,
                message: "This invite has expired. Please invite again.",
            };
        }

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.APP_URL ||
            "http://localhost:3000";

        const inviteLink = `${baseUrl}/invites/${invite.token}`;

        // 3) Send email
        try {
            await sendInviteEmail({
                to: normalizedEmail,
                inviteLink,
                inviterEmail: (ctx as any).user?.email,
            });

            return {
                isSuccess: true,
                type: "invite-sent" as const,
                message: "Invite email re-sent.",
            };
        } catch (e: any) {
            console.error("Failed to resend invite email:", e);

            return {
                isSuccess: false,
                type: "send-invite" as const,
                message: "Failed to resend invite email. Please try again.",
                // dev-only convenience
                inviteLink,
            };
        }
    });
