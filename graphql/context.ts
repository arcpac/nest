import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type GqlContext = {
    req: NextRequest;
    userId: string | null;
    authSource: "nextauth" | "mobile" | "none";
};

export async function makeContext(req: NextRequest): Promise<GqlContext> {
    const nextAuthToken = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const webUserId = (nextAuthToken?.id as string | undefined) ?? null;
    if (webUserId) {
        return { req, userId: webUserId, authSource: "nextauth" };
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const bearer = match?.[1];
    if (!bearer) return { req, userId: null, authSource: "none" };

    try {
        const secret = process.env.MOBILE_JWT_SECRET;
        if (!secret) return { req, userId: null, authSource: "none" };

        const payload = jwt.verify(bearer, secret) as jwt.JwtPayload;

        const mobileUserId =
            typeof payload.userId === "string" ? payload.userId : null;

        return { req, userId: mobileUserId, authSource: "mobile" };
    } catch {
        return { req, userId: null, authSource: "none" };
    }
}
