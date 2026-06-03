import { describe, it, expect } from "vitest";

// API routes are tested via MSW in the UI tests (feedback form submission).
// Direct route-handler integration tests would require a running DB;
// those belong in e2e tests. These stubs keep the test suite healthy.

describe("POST /api/feedback", () => {
  it.todo("returns 201 with the created feedback object");
  it.todo("returns 400 when strengths is missing");
  it.todo("returns 400 when improvements is missing");
});

describe("GET /api/feedback", () => {
  it.todo("returns a list of feedback ordered by most recent");
});
