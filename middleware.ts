import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/groups"];
const publicRoutes = ["/login"];
//next-auth
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Get the JWT token from next-auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isProtectedRoute && !token?.id)
    return NextResponse.redirect(new URL("/login", req.url));
  
  if (isPublicRoute && token?.id)
    return NextResponse.redirect(new URL("/groups", req.url));

  return NextResponse.next();
}
