import { http, HttpResponse } from "msw";
import { validateSubmission } from "@/lib/validation";

const VALID_TOKENS = new Set(["test-token-123"]);
const usedTokens = new Set<string>();

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

    if (!VALID_TOKENS.has(result.data.token)) {
      return HttpResponse.json({ error: "Invalid or unknown token." }, { status: 403 });
    }

    if (usedTokens.has(result.data.token)) {
      return HttpResponse.json({ error: "This link has already been used." }, { status: 409 });
    }

    usedTokens.add(result.data.token);

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
    return HttpResponse.json([]);
  }),
];
