import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedApiPrefixes = ["/api/orders", "/api/cart"];

const authApiRoutes = ["/api/auth/login", "/api/auth/signup", "/api/auth/logout", "/api/auth/me"];

const publicApiPrefixes = ["/api/products", "/api/categories", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // For protected API routes, check auth
  if (protectedApiPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    const token = request.cookies.get("token")?.value || 
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      if (pathname === "/api/cart" && request.method === "GET") {
        // Allow cart reads without auth (will return empty cart)
        return NextResponse.next();
      }
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
  ],
};
