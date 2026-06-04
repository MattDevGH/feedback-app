import { NextResponse } from "next/server";
import { getFeedbackRepository } from "@/lib/repositories";

const MAX_FIELD_LENGTH = 2000;

// POST /api/feedback — submit new feedback
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { strengths, improvements } = body as Record<string, unknown>;

  if (
    typeof strengths !== "string" ||
    strengths.trim() === "" ||
    typeof improvements !== "string" ||
    improvements.trim() === ""
  ) {
    return NextResponse.json(
      { error: "Both 'strengths' and 'improvements' are required." },
      { status: 400 }
    );
  }

  if (strengths.length > MAX_FIELD_LENGTH || improvements.length > MAX_FIELD_LENGTH) {
    return NextResponse.json(
      { error: `Each field must be ${MAX_FIELD_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  const repo = getFeedbackRepository();
  const feedback = await repo.create({
    strengths: strengths.trim(),
    improvements: improvements.trim(),
  });

  return NextResponse.json(feedback, { status: 201 });
}

// GET /api/feedback — retrieve all feedback (admin use)
export async function GET() {
  const repo = getFeedbackRepository();
  const feedback = await repo.findAll();
  return NextResponse.json(feedback);
}
