import { describe, it, expect } from "vitest";
import nextConfig from "../../../next.config";

// These tests verify that the security header configuration is present and correct.
// They test the config object directly — no running server required.
// Actual header delivery is verified manually with:
//   curl -I http://localhost:3000
// or the Security Headers scanner at https://securityheaders.com

async function getHeadersForPath(path: string): Promise<Record<string, string>> {
  const headersConfig = await nextConfig.headers?.();
  if (!headersConfig) return {};

  const matched = headersConfig.find((entry) => {
    // Convert Next.js source pattern (e.g. "/(.*)" ) to a regex
    const pattern = new RegExp("^" + entry.source.replace("(.*)", ".*") + "$");
    return pattern.test(path);
  });

  if (!matched) return {};

  return Object.fromEntries(matched.headers.map((h) => [h.key, h.value]));
}

describe("Security headers", () => {
  it("applies headers to all routes", async () => {
    const rootHeaders = await getHeadersForPath("/");
    const apiHeaders = await getHeadersForPath("/api/feedback");
    const adminHeaders = await getHeadersForPath("/admin");

    expect(Object.keys(rootHeaders).length).toBeGreaterThan(0);
    expect(Object.keys(apiHeaders).length).toBeGreaterThan(0);
    expect(Object.keys(adminHeaders).length).toBeGreaterThan(0);
  });

  it("sets X-Content-Type-Options to nosniff", async () => {
    const headers = await getHeadersForPath("/");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("sets X-Frame-Options to DENY", async () => {
    const headers = await getHeadersForPath("/");
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("sets Referrer-Policy", async () => {
    const headers = await getHeadersForPath("/");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("sets Permissions-Policy restricting camera, microphone, and geolocation", async () => {
    const headers = await getHeadersForPath("/");
    const policy = headers["Permissions-Policy"];
    expect(policy).toContain("camera=()");
    expect(policy).toContain("microphone=()");
    expect(policy).toContain("geolocation=()");
  });

  it("sets a Content-Security-Policy", async () => {
    const headers = await getHeadersForPath("/");
    const csp = headers["Content-Security-Policy"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
  });
});
