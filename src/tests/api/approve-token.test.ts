import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/tokens/[id]/approve/route";
import { MemoryTokenRepository } from "@/lib/repositories/memory-token.repository";
import type { TokenRepository } from "@/lib/repositories/token.repository";

vi.mock("@/lib/repositories", () => ({
  getFeedbackRepository: vi.fn(),
  getTokenRepository: vi.fn(),
}));

import { getTokenRepository } from "@/lib/repositories";

function makeRequest(): Request {
  return new Request("http://localhost/api/tokens/tok-1/approve", {
    method: "POST",
  });
}

const makeParams = (id: string) => Promise.resolve({ id });

describe("POST /api/tokens/[id]/approve", () => {
  let repo: TokenRepository;

  beforeEach(() => {
    repo = new MemoryTokenRepository([
      {
        id: "tok-1",
        token: "abc123",
        name: "Project X colleague",
        message: "We worked together",
        status: "requested",
        createdAt: new Date(),
        usedAt: null,
        expiresAt: null,
        submissionId: null,
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(repo);
  });

  it("approves a requested token and returns 200", async () => {
    const res = await POST(makeRequest(), { params: makeParams("tok-1") });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("pending");
    expect(body.id).toBe("tok-1");
  });

  it("updates the token status in the repository", async () => {
    await POST(makeRequest(), { params: makeParams("tok-1") });
    const token = await repo.findById("tok-1");

    expect(token?.status).toBe("pending");
  });

  it("returns 404 for an unknown token id", async () => {
    const res = await POST(makeRequest(), { params: makeParams("nonexistent") });
    expect(res.status).toBe(404);
  });

  it("returns 409 when token is not in 'requested' state", async () => {
    const pendingRepo = new MemoryTokenRepository([
      {
        id: "tok-pending",
        token: "def456",
        name: "Alice",
        message: null,
        status: "pending",
        createdAt: new Date(),
        usedAt: null,
        expiresAt: null,
        submissionId: null,
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(pendingRepo);

    const res = await POST(makeRequest(), { params: makeParams("tok-pending") });
    expect(res.status).toBe(409);
  });
});
