import { NextRequest, NextResponse } from "next/server";

// Routes that require the admin secret key.
// Note: query-string keys can appear in server logs — acceptable for this
// use case, but consider a cookie-based approach if logs are a concern.
const PROTECTED_PATHS = ["/admin", "/api/feedback"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (!isProtected) return NextResponse.next();

  const adminKey = process.env.ADMIN_SECRET_KEY;

  // Fail securely: if the env var is not set, deny all access rather than
  // accidentally leaving the route open.
  if (!adminKey) {
    console.error("ADMIN_SECRET_KEY is not set — denying access to protected route.");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const providedKey = searchParams.get("key");

  // Use a timing-safe comparison to prevent timing attacks
  if (!providedKey || !timingSafeEqual(providedKey, adminKey)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

// Constant-time string comparison to prevent timing-based key enumeration.
// We can't use crypto.timingSafeEqual in the Edge runtime (no Buffer), so
// we implement it manually by comparing every character regardless of mismatch.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const config = {
  matcher: ["/admin/:path*", "/api/feedback/:path*", "/api/feedback"],
};
