import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-safe auth gate for dashboard routes.
 * Uses next-auth JWT token (works in middleware/edge) instead of server-side auth() helper.
 */
export async function middleware(request: NextRequest) {
  // Allow public routes
  const publicRoutes = ["/login", "/auth"];
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Use JWT token (edge compatible)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-secret",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Employer-only guard
  const userRole = (token as any)?.role;
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
