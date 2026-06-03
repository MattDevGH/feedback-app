import { http, HttpResponse } from "msw";

const mockFeedback = [
  {
    id: "cltest0001",
    strengths: "Great communicator",
    improvements: "Could delegate more",
    submittedAt: "2026-01-15T10:30:00.000Z",
  },
];

export const handlers = [
  http.post("/api/feedback", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const { strengths, improvements } = body;

    if (!strengths || typeof strengths !== "string" || strengths.trim() === "") {
      return HttpResponse.json(
        { error: "Both 'strengths' and 'improvements' are required." },
        { status: 400 }
      );
    }
    if (!improvements || typeof improvements !== "string" || improvements.trim() === "") {
      return HttpResponse.json(
        { error: "Both 'strengths' and 'improvements' are required." },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        id: "clnew0001",
        strengths: (strengths as string).trim(),
        improvements: (improvements as string).trim(),
        submittedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.get("/api/feedback", () => {
    return HttpResponse.json(mockFeedback);
  }),
];
