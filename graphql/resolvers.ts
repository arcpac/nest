import { Group } from "@/app/types";
import { db } from "@/db";

import { groups, members, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { GqlContext } from "./context";

export const resolvers = {
    Query: {
        group: async (_: Group, args: { groupId: string }, ctx: GqlContext) => {
            if (!ctx.userId) return null

            const [membership] = await db
                .select()
                .from(members)
                .where(and(eq(members.group_id, args.groupId), eq(members.user_id, ctx.userId)))
                .limit(1)

            if (!membership) return null

            const [group] = await db
                .select()
                .from(groups)
                .where(eq(groups.id, args.groupId))
                .limit(1)
            return group
        }
    },
    Group: {
        members: async (group: { id: string }) => {
            return db.select().from(members).where(eq(members.group_id, group.id));
        },
    },
    Member: {
        user: async (member: { user_id: string }) => {
            const [u] = await db.select().from(users).where(eq(users.id, member.user_id));
            return u ?? null;
        },
    },
};