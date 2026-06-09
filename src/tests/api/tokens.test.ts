import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as createToken, GET as listTokens } from "@/app/api/tokens/route";
import { MemoryTokenRepository } from "@/lib/repositories/memory-token.repository";
import type { TokenRepository } from "@/lib/repositories/token.repository";

vi.mock("@/lib/repositories", () => ({
  getFeedbackRepository: vi.fn(),
  getTokenRepository: vi.fn(),
}));

import { getTokenRepository } from "@/lib/repositories";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/tokens", () => {
  let repo: TokenRepository;

  beforeEach(() => {
    repo = new MemoryTokenRepository();
    vi.mocked(getTokenRepository).mockReturnValue(repo);
  });

  it("creates a token with a name and returns 201", async () => {
    const res = await createToken(makeRequest({ name: "Alice" }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.name).toBe("Alice");
    expect(body.token).toBeDefined();
    expect(body.token.length).toBe(64); // 32 bytes hex
    expect(body.submissionId).toBeNull();
  });

  it("creates a token with an expiry date", async () => {
    const expiresAt = "2026-12-31T23:59:59.000Z";
    const res = await createToken(makeRequest({ name: "Bob", expiresAt }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.expiresAt).toBe(expiresAt);
  });

  it("returns 400 when name is missing", async () => {
    const res = await createToken(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is blank", async () => {
    const res = await createToken(makeRequest({ name: "   " }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/tokens", () => {
  beforeEach(() => {
    const repo = new MemoryTokenRepository([
      {
        id: "tok-1",
        token: "abc123",
        name: "Alice",
        message: null,
        status: "pending",
        createdAt: new Date("2026-01-01"),
        usedAt: null,
        expiresAt: null,
        submissionId: null,
      },
      {
        id: "tok-2",
        token: "def456",
        name: "Bob",
        message: null,
        status: "submitted",
        createdAt: new Date("2026-01-02"),
        usedAt: new Date("2026-01-03"),
        expiresAt: new Date("2026-06-01"),
        submissionId: "sub-1",
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(repo);
  });

  it("returns all tokens", async () => {
    const res = await listTokens();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("includes submission status", async () => {
    const res = await listTokens();
    const body = await res.json();

    const alice = body.find((t: { name: string }) => t.name === "Alice");
    const bob = body.find((t: { name: string }) => t.name === "Bob");
    expect(alice.submissionId).toBeNull();
    expect(bob.submissionId).toBe("sub-1");
  });
});
