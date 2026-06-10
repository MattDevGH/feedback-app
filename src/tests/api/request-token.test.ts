import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/tokens/request/route";
import { MemoryTokenRepository } from "@/lib/repositories/memory-token.repository";
import type { TokenRepository } from "@/lib/repositories/token.repository";

vi.mock("@/lib/repositories", () => ({
  getFeedbackRepository: vi.fn(),
  getTokenRepository: vi.fn(),
}));

import { getTokenRepository } from "@/lib/repositories";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/tokens/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/tokens/request", () => {
  let repo: TokenRepository;

  beforeEach(() => {
    repo = new MemoryTokenRepository();
    vi.mocked(getTokenRepository).mockReturnValue(repo);
  });

  it("creates a token with status 'requested' and returns 201", async () => {
    const res = await POST(
      makeRequest({ name: "Project X colleague", message: "We worked together on Project X" }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.name).toBe("Project X colleague");
    expect(body.message).toBe("We worked together on Project X");
    expect(body.status).toBe("requested");
    expect(body.token).toBeDefined();
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({ message: "Hello" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is missing", async () => {
    const res = await POST(makeRequest({ name: "Alice" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message exceeds 150 characters", async () => {
    const res = await POST(makeRequest({ name: "Alice", message: "a".repeat(151) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name is blank", async () => {
    const res = await POST(makeRequest({ name: "   ", message: "Hello" }));
    expect(res.status).toBe(400);
  });

  it("returns 503 when too many requests are pending", async () => {
    // Pre-fill the repo with 10 requested tokens
    const fullRepo = new MemoryTokenRepository(
      Array.from({ length: 10 }, (_, i) => ({
        id: `tok-${i}`,
        token: `token-${i}`,
        name: `Person ${i}`,
        message: "Test",
        status: "requested" as const,
        createdAt: new Date(),
        usedAt: null,
        expiresAt: null,
        submissionId: null,
      })),
    );
    vi.mocked(getTokenRepository).mockReturnValue(fullRepo);

    const res = await POST(makeRequest({ name: "One more", message: "Please" }));
    expect(res.status).toBe(503);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/tokens/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
