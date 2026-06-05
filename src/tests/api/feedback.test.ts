import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/feedback/route";
import { MemoryFeedbackRepository } from "@/lib/repositories/memory-feedback.repository";
import type { FeedbackRepository } from "@/lib/repositories/feedback.repository";

vi.mock("@/lib/repositories", () => ({
  getFeedbackRepository: vi.fn(),
}));

import { getFeedbackRepository } from "@/lib/repositories";

// A minimal valid payload — one response per mandatory question in each section
const validResponses = [
  { questionKey: "praise-1", value: "Great communicator" },
  { questionKey: "criticism-1", value: "Could delegate more" },
  { questionKey: "suggestion-1", value: "Should seek feedback more regularly" },
];

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  let repo: FeedbackRepository;

  beforeEach(() => {
    repo = new MemoryFeedbackRepository();
    vi.mocked(getFeedbackRepository).mockReturnValue(repo);
  });

  it("returns 201 with the created submission", async () => {
    const res = await POST(makeRequest({ responses: validResponses }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.submittedAt).toBeDefined();
    expect(body.responses).toHaveLength(3);
  });

  it("trims whitespace from response values", async () => {
    const res = await POST(
      makeRequest({
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

  it("returns 400 when responses is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when responses is empty", async () => {
    const res = await POST(makeRequest({ responses: [] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unknown questionKey", async () => {
    const res = await POST(
      makeRequest({
        responses: [...validResponses, { questionKey: "not-a-real-key", value: "something" }],
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when a value is blank whitespace", async () => {
    const res = await POST(
      makeRequest({
        responses: [
          { questionKey: "praise-1", value: "   " },
          { questionKey: "criticism-1", value: "Fine" },
          { questionKey: "suggestion-1", value: "Fine" },
        ],
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when a value exceeds 2000 characters", async () => {
    const res = await POST(
      makeRequest({
        responses: [
          { questionKey: "praise-1", value: "a".repeat(2001) },
          { questionKey: "criticism-1", value: "Fine" },
          { questionKey: "suggestion-1", value: "Fine" },
        ],
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/2000/);
  });

  it("returns 400 when a mandatory section has no answer", async () => {
    const res = await POST(
      makeRequest({
        responses: [
          // missing praise-1 (mandatory)
          { questionKey: "criticism-1", value: "Fine" },
          { questionKey: "suggestion-1", value: "Fine" },
        ],
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.incompleteSections).toContain("praise");
  });

  it("returns 400 when all three sections are incomplete", async () => {
    const res = await POST(
      makeRequest({
        responses: [
          { questionKey: "praise-2", value: "Something optional" }, // only optional praise question
        ],
      }),
    );
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.incompleteSections).toHaveLength(3);
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
      {
        id: "sub-2",
        submittedAt: new Date("2026-01-01"),
        responses: [
          { id: "r4", questionKey: "praise-1", value: "Clear communicator" },
          { id: "r5", questionKey: "criticism-1", value: "Delegate more" },
          { id: "r6", questionKey: "suggestion-1", value: "Share context earlier" },
        ],
      },
    ]);
    vi.mocked(getFeedbackRepository).mockReturnValue(repo);
  });

  it("returns 200 with all submissions", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("returns submissions with responses", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body[0].responses).toBeDefined();
    expect(body[0].responses.length).toBeGreaterThan(0);
  });
});
