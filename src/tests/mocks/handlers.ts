import { http, HttpResponse } from "msw";
import { QUESTIONS, CATEGORIES, isSectionComplete } from "@/lib/questions.config";

const validKeys = new Set(QUESTIONS.map((q) => q.key));
const MAX_FIELD_LENGTH = 2000;

const mockSubmissions = [
  {
    id: "cltest0001",
    submittedAt: "2026-01-15T10:30:00.000Z",
    responses: [
      { id: "r1", questionKey: "praise-1", value: "Great communicator" },
      { id: "r2", questionKey: "criticism-1", value: "Could delegate more" },
      { id: "r3", questionKey: "suggestion-1", value: "Should seek feedback more often" },
    ],
  },
];

export const handlers = [
  http.post("/api/feedback", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const { responses } = body;

    if (!Array.isArray(responses) || responses.length === 0) {
      return HttpResponse.json(
        { error: "responses must be a non-empty array." },
        { status: 400 }
      );
    }

    for (const r of responses) {
      const { questionKey, value } = r as Record<string, unknown>;
      if (typeof questionKey !== "string" || !validKeys.has(questionKey)) {
        return HttpResponse.json({ error: `Unknown questionKey: ${questionKey}` }, { status: 400 });
      }
      if (typeof value !== "string" || value.trim() === "") {
        return HttpResponse.json(
          { error: `Value for question "${questionKey}" must be a non-empty string.` },
          { status: 400 }
        );
      }
      if (value.length > MAX_FIELD_LENGTH) {
        return HttpResponse.json(
          { error: `Each answer must be ${MAX_FIELD_LENGTH} characters or fewer.` },
          { status: 400 }
        );
      }
    }

    const answers: Record<string, string> = {};
    for (const r of responses as Array<{ questionKey: string; value: string }>) {
      answers[r.questionKey] = r.value;
    }

    const incompleteSections = CATEGORIES.filter((c) => !isSectionComplete(c, answers));
    if (incompleteSections.length > 0) {
      return HttpResponse.json(
        { error: `Incomplete sections: ${incompleteSections.join(", ")}`, incompleteSections },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        id: "clnew0001",
        submittedAt: new Date().toISOString(),
        responses: (responses as Array<{ questionKey: string; value: string }>).map((r, i) => ({
          id: `r-new-${i}`,
          questionKey: r.questionKey,
          value: r.value.trim(),
        })),
      },
      { status: 201 }
    );
  }),

  http.get("/api/feedback", () => {
    return HttpResponse.json(mockSubmissions);
  }),
];
