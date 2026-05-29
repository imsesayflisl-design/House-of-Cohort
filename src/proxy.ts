import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    if (role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (role === "STAFF") {
      if (
        pathname.startsWith("/admin/staff") ||
        pathname.startsWith("/admin/discounts")
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  if (pathname.startsWith("/account") || pathname.startsWith("/wishlist")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/wishlist/:path*"],
};
