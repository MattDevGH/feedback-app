import { http, HttpResponse } from "msw";
import { validateSubmission } from "@/lib/validation";

export const handlers = [
  http.post("/api/feedback", async ({ request }) => {
    const body = await request.json();
    const result = validateSubmission(body);

    if (!result.success) {
      return HttpResponse.json(
        { error: result.error, incompleteSections: result.incompleteSections },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        id: "mock-submission-1",
        submittedAt: new Date().toISOString(),
        responses: result.data.responses.map((r, i) => ({
          id: `mock-r-${i}`,
          questionKey: r.questionKey,
          value: r.value.trim(),
        })),
      },
      { status: 201 },
    );
  }),

  http.get("/api/feedback", () => {
    return HttpResponse.json([
      {
        id: "mock-submission-existing",
        submittedAt: "2026-01-15T10:30:00.000Z",
        responses: [
          { id: "r1", questionKey: "praise-1", value: "Great communicator" },
          { id: "r2", questionKey: "criticism-1", value: "Could delegate more" },
          { id: "r3", questionKey: "suggestion-1", value: "Should seek feedback more often" },
        ],
      },
    ]);
  }),
];
