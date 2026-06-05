import { NextResponse } from "next/server";
import { getFeedbackRepository } from "@/lib/repositories";
import { validateSubmission } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await parseJson(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = validateSubmission(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error, incompleteSections: result.incompleteSections },
      { status: 400 },
    );
  }

  const repo = getFeedbackRepository();
  const submission = await repo.create({
    responses: result.data.responses.map((r) => ({
      questionKey: r.questionKey,
      value: r.value.trim(),
    })),
  });

  return NextResponse.json(submission, { status: 201 });
}

export async function GET() {
  const repo = getFeedbackRepository();
  const submissions = await repo.findAll();
  return NextResponse.json(submissions);
}

async function parseJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
