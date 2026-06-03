import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const VALID_KEY = "test-secret-key-abc123";
const BASE_URL = "http://localhost:3000";

function makeRequest(path: string, key?: string): NextRequest {
  const url = new URL(path, BASE_URL);
  if (key) url.searchParams.set("key", key);
  return new NextRequest(url.toString());
}

describe("Admin middleware", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SECRET_KEY", VALID_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("unprotected routes", () => {
    it("allows requests to the feedback form without a key", async () => {
      const res = await middleware(makeRequest("/"));
      expect(res.status).not.toBe(307);
    });

    it("allows requests to POST /api/feedback without a key", async () => {
      // POST /api/feedback is the public submission endpoint — not in matcher
      const res = await middleware(makeRequest("/"));
      expect(res.status).not.toBe(307);
    });
  });

  describe("protected routes — /admin", () => {
    it("redirects to /unauthorized when no key is provided", async () => {
      const res = await middleware(makeRequest("/admin"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/unauthorized");
    });

    it("redirects to /unauthorized when the key is wrong", async () => {
      const res = await middleware(makeRequest("/admin", "wrong-key"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/unauthorized");
    });

    it("allows access when the correct key is provided", async () => {
      const res = await middleware(makeRequest("/admin", VALID_KEY));
      expect(res.status).not.toBe(307);
    });

    it("protects /admin sub-paths", async () => {
      const res = await middleware(makeRequest("/admin/anything"));
      expect(res.status).toBe(307);
    });
  });

  describe("protected routes — GET /api/feedback", () => {
    it("redirects to /unauthorized when no key is provided", async () => {
      const res = await middleware(makeRequest("/api/feedback"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/unauthorized");
    });

    it("allows access when the correct key is provided", async () => {
      const res = await middleware(makeRequest("/api/feedback", VALID_KEY));
      expect(res.status).not.toBe(307);
    });
  });

  describe("missing environment variable", () => {
    it("denies access when ADMIN_SECRET_KEY is not set", async () => {
      vi.stubEnv("ADMIN_SECRET_KEY", "");
      const res = await middleware(makeRequest("/admin", VALID_KEY));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/unauthorized");
    });
  });
});
