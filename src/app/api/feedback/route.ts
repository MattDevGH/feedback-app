import { NextResponse } from "next/server";
import { getFeedbackRepository } from "@/lib/repositories";
import { QUESTIONS, CATEGORIES, isSectionComplete } from "@/lib/questions.config";

const MAX_FIELD_LENGTH = 2000;

// POST /api/feedback — submit a feedback submission
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { responses } = body as Record<string, unknown>;

  // responses must be an array of { questionKey, value } objects
  if (!Array.isArray(responses) || responses.length === 0) {
    return NextResponse.json(
      { error: "responses must be a non-empty array." },
      { status: 400 }
    );
  }

  // Validate each response entry
  const validKeys = new Set(QUESTIONS.map((q) => q.key));
  for (const r of responses) {
    if (typeof r !== "object" || r === null) {
      return NextResponse.json({ error: "Each response must be an object." }, { status: 400 });
    }
    const { questionKey, value } = r as Record<string, unknown>;
    if (typeof questionKey !== "string" || !validKeys.has(questionKey)) {
      return NextResponse.json(
        { error: `Unknown questionKey: ${questionKey}` },
        { status: 400 }
      );
    }
    if (typeof value !== "string" || value.trim() === "") {
      return NextResponse.json(
        { error: `Value for question "${questionKey}" must be a non-empty string.` },
        { status: 400 }
      );
    }
    if (value.length > MAX_FIELD_LENGTH) {
      return NextResponse.json(
        { error: `Each answer must be ${MAX_FIELD_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }
  }

  // Build answers map for section completion check
  const answers: Record<string, string> = {};
  for (const r of responses as Array<{ questionKey: string; value: string }>) {
    answers[r.questionKey] = r.value;
  }

  // Validate section completion
  const incompleteSections = CATEGORIES.filter(
    (category) => !isSectionComplete(category, answers)
  );
  if (incompleteSections.length > 0) {
    return NextResponse.json(
      {
        error: `Incomplete sections: ${incompleteSections.join(", ")}. Each section requires at least the mandatory questions to be answered.`,
        incompleteSections,
      },
      { status: 400 }
    );
  }

  const repo = getFeedbackRepository();
  const submission = await repo.create({
    responses: (responses as Array<{ questionKey: string; value: string }>).map((r) => ({
      questionKey: r.questionKey,
      value: r.value.trim(),
    })),
  });

  return NextResponse.json(submission, { status: 201 });
}

// GET /api/feedback — retrieve all submissions (admin use)
export async function GET() {
  const repo = getFeedbackRepository();
  const submissions = await repo.findAll();
  return NextResponse.json(submissions);
}
