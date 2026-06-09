import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/feedback/anonymous/route";
import { MemoryTokenRepository } from "@/lib/repositories/memory-token.repository";
import type { TokenRepository } from "@/lib/repositories/token.repository";

vi.mock("@/lib/repositories", () => ({
  getFeedbackRepository: vi.fn(),
  getTokenRepository: vi.fn(),
}));

import { getTokenRepository } from "@/lib/repositories";

const VALID_TOKEN = "anon-test-token-123";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/feedback/anonymous", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback/anonymous", () => {
  let tokenRepo: TokenRepository;

  beforeEach(() => {
    tokenRepo = new MemoryTokenRepository([
      {
        id: "tok-1",
        token: VALID_TOKEN,
        name: "Alice",
        status: "pending",
        createdAt: new Date(),
        usedAt: null,
        expiresAt: null,
        submissionId: null,
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(tokenRepo);
  });

  it("marks a pending token as anonymous and returns 200", async () => {
    const res = await POST(makeRequest({ token: VALID_TOKEN }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("anonymous");
    expect(body.usedAt).toBeDefined();
  });

  it("updates the token status in the repository", async () => {
    await POST(makeRequest({ token: VALID_TOKEN }));
    const token = await tokenRepo.findByToken(VALID_TOKEN);

    expect(token?.status).toBe("anonymous");
    expect(token?.usedAt).not.toBeNull();
  });

  it("returns 400 when token is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 403 for an unknown token", async () => {
    const res = await POST(makeRequest({ token: "nonexistent" }));
    expect(res.status).toBe(403);
  });

  it("returns 409 when token has already been used (submitted)", async () => {
    const usedRepo = new MemoryTokenRepository([
      {
        id: "tok-used",
        token: "used-token",
        name: "Bob",
        status: "submitted",
        createdAt: new Date(),
        usedAt: new Date(),
        expiresAt: null,
        submissionId: "sub-1",
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(usedRepo);

    const res = await POST(makeRequest({ token: "used-token" }));
    expect(res.status).toBe(409);
  });

  it("returns 409 when token has already been used (anonymous)", async () => {
    const usedRepo = new MemoryTokenRepository([
      {
        id: "tok-anon",
        token: "anon-token",
        name: "Carol",
        status: "anonymous",
        createdAt: new Date(),
        usedAt: new Date(),
        expiresAt: null,
        submissionId: null,
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(usedRepo);

    const res = await POST(makeRequest({ token: "anon-token" }));
    expect(res.status).toBe(409);
  });

  it("returns 410 when token has expired", async () => {
    const expiredRepo = new MemoryTokenRepository([
      {
        id: "tok-expired",
        token: "expired-token",
        name: "Dave",
        status: "pending",
        createdAt: new Date("2025-01-01"),
        usedAt: null,
        expiresAt: new Date("2025-06-01"),
        submissionId: null,
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(expiredRepo);

    const res = await POST(makeRequest({ token: "expired-token" }));
    expect(res.status).toBe(410);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/feedback/anonymous", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
