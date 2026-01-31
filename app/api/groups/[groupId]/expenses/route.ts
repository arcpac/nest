import { getGroupExpenses } from "@/app/(main-app)/actions/groups";
import { verifyMobileToken } from "@/lib/mobileAuth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { groupId } = await params;

  if (!groupId) {
    return NextResponse.json({ ok: false, error: "Missing groupId" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 401 });
  }

  let userId: string;
  try {
    ({ userId } = await verifyMobileToken(token));
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  // TODO: ensure membership
  // const isMember = await isUserInGroup(groupId, userId);
  // if (!isMember) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  const { expenses } = await getGroupExpenses(groupId, userId);

  return NextResponse.json({ ok: true, data: expenses });// expensesShares
}
