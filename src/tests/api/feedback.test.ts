import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/feedback/route";
import { MemoryFeedbackRepository } from "@/lib/repositories/memory-feedback.repository";
import { MemoryTokenRepository } from "@/lib/repositories/memory-token.repository";
import type { FeedbackRepository } from "@/lib/repositories/feedback.repository";
import type { TokenRepository } from "@/lib/repositories/token.repository";

vi.mock("@/lib/repositories", () => ({
  getFeedbackRepository: vi.fn(),
  getTokenRepository: vi.fn(),
}));

import { getFeedbackRepository, getTokenRepository } from "@/lib/repositories";

const VALID_TOKEN = "valid-token-abc123";

const validPayload = {
  token: VALID_TOKEN,
  responses: [
    { questionKey: "praise-1", value: "Great communicator" },
    { questionKey: "criticism-1", value: "Could delegate more" },
    { questionKey: "suggestion-1", value: "Should seek feedback more regularly" },
  ],
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  let feedbackRepo: FeedbackRepository;
  let tokenRepo: TokenRepository;

  beforeEach(() => {
    feedbackRepo = new MemoryFeedbackRepository();
    tokenRepo = new MemoryTokenRepository([
      {
        id: "tok-1",
        token: VALID_TOKEN,
        name: "Alice",
        message: null,
        status: "pending",
        createdAt: new Date(),
        usedAt: null,
        expiresAt: null,
        submissionId: null,
      },
    ]);
    vi.mocked(getFeedbackRepository).mockReturnValue(feedbackRepo);
    vi.mocked(getTokenRepository).mockReturnValue(tokenRepo);
  });

  it("returns 201 with a valid token and complete responses", async () => {
    const res = await POST(makeRequest(validPayload));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.submittedAt).toBeDefined();
    expect(body.responses).toHaveLength(3);
  });

  it("marks the token as submitted", async () => {
    await POST(makeRequest(validPayload));
    const token = await tokenRepo.findByToken(VALID_TOKEN);
    expect(token?.status).toBe("submitted");
    expect(token?.submissionId).not.toBeNull();
  });

  it("trims whitespace from response values", async () => {
    const res = await POST(
      makeRequest({
        token: VALID_TOKEN,
        responses: [
          { questionKey: "praise-1", value: "  Great communicator  " },
          { questionKey: "criticism-1", value: "  Delegates poorly  " },
          { questionKey: "suggestion-1", value: "  Seek more feedback  " },
        ],
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.responses[0].value).toBe("Great communicator");
  });

  it("returns 400 when token is missing", async () => {
    const res = await POST(makeRequest({ responses: validPayload.responses }));
    expect(res.status).toBe(400);
  });

  it("returns 403 for an unknown token", async () => {
    const res = await POST(makeRequest({ ...validPayload, token: "nonexistent-token" }));
    expect(res.status).toBe(403);
  });

  it("returns 409 when token has already been used", async () => {
    // Submit once
    await POST(makeRequest(validPayload));
    // Try again with same token
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(409);
  });

  it("returns 410 when token has expired", async () => {
    const expiredTokenRepo = new MemoryTokenRepository([
      {
        id: "tok-expired",
        token: "expired-token",
        name: "Bob",
        message: null,
        status: "pending",
        createdAt: new Date("2025-01-01"),
        usedAt: null,
        expiresAt: new Date("2025-06-01"), // already expired
        submissionId: null,
      },
    ]);
    vi.mocked(getTokenRepository).mockReturnValue(expiredTokenRepo);

    const res = await POST(makeRequest({ ...validPayload, token: "expired-token" }));
    expect(res.status).toBe(410);
  });

  it("returns 400 when responses are missing", async () => {
    const res = await POST(makeRequest({ token: VALID_TOKEN }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when responses are empty", async () => {
    const res = await POST(makeRequest({ token: VALID_TOKEN, responses: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when a mandatory section has no answer", async () => {
    const res = await POST(
      makeRequest({
        token: VALID_TOKEN,
        responses: [
          { questionKey: "criticism-1", value: "Fine" },
          { questionKey: "suggestion-1", value: "Fine" },
        ],
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.incompleteSections).toContain("praise");
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/feedback", () => {
  beforeEach(() => {
    const repo = new MemoryFeedbackRepository([
      {
        id: "sub-1",
        submittedAt: new Date("2026-01-02"),
        responses: [
          { id: "r1", questionKey: "praise-1", value: "Good listener" },
          { id: "r2", questionKey: "criticism-1", value: "Slow to decide" },
          { id: "r3", questionKey: "suggestion-1", value: "More 1:1s" },
        ],
      },
    ]);
    vi.mocked(getFeedbackRepository).mockReturnValue(repo);
    vi.mocked(getTokenRepository).mockReturnValue(new MemoryTokenRepository());
  });

  it("returns 200 with all submissions", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
  });
});
