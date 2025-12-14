import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-safe auth gate for dashboard routes.
 * Uses next-auth JWT token (works in middleware/edge) instead of server-side auth() helper.
 */
export async function middleware(request: NextRequest) {
  // #region agent log
  // Edge runtime logging - use console.error which works in Edge runtime
  console.error(JSON.stringify({location:'middleware.ts:middleware',message:'Middleware called',data:{pathname:request.nextUrl.pathname,method:request.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
  // #endregion
  // Allow public routes
  const publicRoutes = ["/", "/login", "/auth", "/register"];
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      return request.nextUrl.pathname === "/";
    }
    return request.nextUrl.pathname.startsWith(route);
  });
  // #region agent log
  console.error(JSON.stringify({location:'middleware.ts:middleware',message:'Public route check',data:{isPublicRoute,pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
  // #endregion
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Use JWT token (edge compatible)
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-secret";
  // #region agent log
  console.error(JSON.stringify({location:'middleware.ts:middleware',message:'Getting token',data:{hasSecret:!!secret,pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
  // #endregion
  const token = await getToken({
    req: request,
    secret,
  });
  // #region agent log
  console.error(JSON.stringify({location:'middleware.ts:middleware',message:'Token retrieved',data:{hasToken:!!token,tokenRole:(token as any)?.role,pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
  // #endregion

  if (!token) {
    // #region agent log
    console.error(JSON.stringify({location:'middleware.ts:middleware',message:'No token - redirecting to login',data:{pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
    // #endregion
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Employer-only guard
  const userRole = (token as any)?.role;
  // #region agent log
  console.error(JSON.stringify({location:'middleware.ts:middleware',message:'Role check',data:{userRole,pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
  // #endregion
  if (userRole !== "employer") {
    // #region agent log
    console.error(JSON.stringify({location:'middleware.ts:middleware',message:'Role mismatch - returning 403',data:{userRole,pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
    // #endregion
    return NextResponse.json(
      { error: "Unauthorized: Only employers can access this portal" },
      { status: 403 }
    );
  }

  // #region agent log
  console.error(JSON.stringify({location:'middleware.ts:middleware',message:'Middleware passed - allowing request',data:{pathname:request.nextUrl.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'}));
  // #endregion
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|).*)"],
};
