import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "odf_admin_session";
const SECRET = process.env.ADMIN_JWT_SECRET;
const SECRET_KEY = SECRET ? new TextEncoder().encode(SECRET) : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      if (!SECRET_KEY) {
        throw new Error("Secret missing");
      }

      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("JWT verification failed:", error);
      }

      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, message: "Sesion invalida." }, { status: 401 });
      }

      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete(ADMIN_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
