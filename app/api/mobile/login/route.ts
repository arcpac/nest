import { NextResponse } from "next/server";
import { signMobileToken } from "@/lib/mobileAuth";
import { verifyUserCredentials } from "@/lib/verifyUserCredentials";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const { email, password } = await req.json();
    const user = await verifyUserCredentials(email, password);
    if (!user) return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });

    const token = await signMobileToken({ userId: user.id });

    return NextResponse.json({ ok: true, token, user: { id: user.id, email: user.email } });
}
