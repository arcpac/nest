import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // const url = req.nextUrl;
    // if (url.pathname === "/household") {
    //   console.log("[middleware.ts]", url);
    //   return NextResponse.redirect(new URL("/dashboard", req.url));
    // }
    // return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/household"],
};
