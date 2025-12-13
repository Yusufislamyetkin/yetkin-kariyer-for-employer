import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/auth"];
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  // If accessing public route, allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If not authenticated, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // EMPLOYER-ONLY: Check if user is employer
  const userRole = (session.user as any)?.role;
  if (userRole !== "employer") {
    return NextResponse.json(
      { error: "Unauthorized: Only employers can access this portal" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|).*)"],
};
