import "server-only";

import { NextRequest } from "next/server";
import { verifyMobileToken } from "@/lib/mobileAuth";

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) return null;

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) return null;

    const token = match[1]?.trim();
    if (!token) return null;

    try {
        const { userId } = await verifyMobileToken(token);
        return userId;
    } catch {
        return null;
    }
}
