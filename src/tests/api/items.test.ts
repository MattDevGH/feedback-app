import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/feedback/route";
import { MemoryFeedbackRepository } from "@/lib/repositories/memory-feedback.repository";
import type { FeedbackRepository } from "@/lib/repositories/feedback.repository";

// Inject a MemoryFeedbackRepository so these tests never touch a real database.
// We mock the factory module and replace it before each test.
vi.mock("@/lib/repositories", () => ({
  getFeedbackRepository: vi.fn(),
}));

import { getFeedbackRepository } from "@/lib/repositories";

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

  it("returns 201 with the created feedback object", async () => {
    const req = makeRequest({ strengths: "Great listener", improvements: "More proactive" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.strengths).toBe("Great listener");
    expect(body.improvements).toBe("More proactive");
    expect(body.id).toBeDefined();
    expect(body.submittedAt).toBeDefined();
  });

  it("trims whitespace from both fields", async () => {
    const req = makeRequest({ strengths: "  Great listener  ", improvements: "  More proactive  " });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.strengths).toBe("Great listener");
    expect(body.improvements).toBe("More proactive");
  });

  it("returns 400 when strengths is missing", async () => {
    const req = makeRequest({ improvements: "More proactive" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when improvements is missing", async () => {
    const req = makeRequest({ strengths: "Great listener" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when strengths is blank whitespace", async () => {
    const req = makeRequest({ strengths: "   ", improvements: "More proactive" });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 400 when a field exceeds 2000 characters", async () => {
    const req = makeRequest({ strengths: "a".repeat(2001), improvements: "Fine" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/2000/);
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
      { id: "1", strengths: "Good listener", improvements: "Be more proactive", submittedAt: new Date("2026-01-02") },
      { id: "2", strengths: "Clear communicator", improvements: "Delegate more", submittedAt: new Date("2026-01-01") },
    ]);
    vi.mocked(getFeedbackRepository).mockReturnValue(repo);
  });

  it("returns 200 with all feedback", async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("returns feedback with expected fields", async () => {
    const res = await GET();
    const body = await res.json();

    expect(body[0]).toMatchObject({
      id: expect.any(String),
      strengths: expect.any(String),
      improvements: expect.any(String),
      submittedAt: expect.any(String),
    });
  });
});
