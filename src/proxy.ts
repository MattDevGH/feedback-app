import { NextRequest, NextResponse } from "next/server";

// Routes that require the admin secret key.
// POST /api/feedback is NOT protected — it validates via token in the request body.
// GET /api/feedback, /api/tokens, and /admin are admin-only.
const PROTECTED_PATHS = ["/admin", "/api/tokens"];

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Public endpoints that live under otherwise-protected paths
  if (pathname === "/api/tokens/request") return NextResponse.next();

  // GET /api/feedback is admin-protected; POST is public (token-validated)
  const isProtectedFeedbackGet = pathname === "/api/feedback" && request.method === "GET";

  const isProtectedPath = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  if (!isProtectedPath && !isProtectedFeedbackGet) return NextResponse.next();

  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey) {
    console.error("ADMIN_SECRET_KEY is not set — denying access to protected route.");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const providedKey = searchParams.get("key");

  if (!providedKey || !timingSafeEqual(providedKey, adminKey)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

// Constant-time string comparison to prevent timing-based key enumeration.
function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  const paddedA = a.padEnd(maxLen, "\0");
  const paddedB = b.padEnd(maxLen, "\0");

  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    result |= paddedA.charCodeAt(i) ^ paddedB.charCodeAt(i);
  }
  return result === 0;
}

export const config = {
  matcher: ["/admin/:path*", "/api/tokens/:path*", "/api/tokens", "/api/feedback"],
};
