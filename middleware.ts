import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/groups", "/expenses"];
const publicRoutes = ["/login"];
//next-auth
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isCreateExpenseRoute = /^\/groups\/[^/]+\/create-expense$/.test(path);

  // Get the JWT token from next-auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isProtectedRoute && !token?.id && !isCreateExpenseRoute)
    return NextResponse.redirect(new URL("/login", req.url));

  if (isPublicRoute && token?.id)
    return NextResponse.redirect(new URL("/groups", req.url));

  return NextResponse.next();
}
