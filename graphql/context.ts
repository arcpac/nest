// graphql/context.ts
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export type GqlContext = {
    req: NextRequest;
    userId: string | null;
};

export async function makeContext(req: NextRequest): Promise<GqlContext> {
    // getToken will read from cookies, and can also read Authorization header
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });
    return {
        req,
        userId: (token?.id as string) ?? null,
    };
}
