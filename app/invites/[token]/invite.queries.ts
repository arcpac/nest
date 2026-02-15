import "server-only";

import { db } from "@/db";
import { groupInvites, groups } from "@/db/schema";
import { eq } from "drizzle-orm";

export type InviteLookupResult =
    | {
        ok: true;
        invite: {
            id: string;
            token: string;
            groupId: string;
            groupName: string | null;
            email: string;
            status: string;
            expiresAt: Date | null;
        };
    }
    | { ok: false; reason: "not_found" | "expired" | "already_used" };

export async function getInviteByToken(token: string): Promise<InviteLookupResult> {
    const [row] = await db
        .select({
            id: groupInvites.id,
            token: groupInvites.token,
            groupId: groupInvites.group_id,
            email: groupInvites.email,
            status: groupInvites.status,
            expiresAt: groupInvites.expires_at,
            groupName: groups.name,
        })
        .from(groupInvites)
        .leftJoin(groups, eq(groups.id, groupInvites.group_id))
        .where(eq(groupInvites.token, token))
        .limit(1);

    if (!row) return { ok: false, reason: "not_found" };

    if (row.status !== "pending") return { ok: false, reason: "already_used" };

    if (row.expiresAt && row.expiresAt < new Date()) return { ok: false, reason: "expired" };

    return {
        ok: true,
        invite: {
            id: row.id,
            token: row.token,
            groupId: row.groupId,
            groupName: row.groupName ?? null,
            email: row.email,
            status: row.status,
            expiresAt: row.expiresAt ?? null,
        },
    };
}
