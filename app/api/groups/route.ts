import { NextResponse } from "next/server";
import { verifyMobileToken } from "@/lib/mobileAuth";
import { getUserExpenseShares } from "@/app/(main-app)/actions/expenseList";
import { getUserGroups } from "@/app/(main-app)/actions/groups";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) {
        return NextResponse.json({ ok: false, error: "Missing token" }, { status: 401 });
    }

    let userId: string;
    try {
        ({ userId } = await verifyMobileToken(token));
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    try {
        const userGroups = await getUserGroups(userId);
        return NextResponse.json({ ok: true, data: userGroups });
    } catch (error) {
        console.error("Failed to fetch user groups:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch groups" }, { status: 500 });
    }
}
