import { NextResponse } from "next/server";
import { getFeedbackRepository, getTokenRepository } from "@/lib/repositories";
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

  // Validate the token
  const tokenRepo = getTokenRepository();
  const reviewToken = await tokenRepo.findByToken(result.data.token);

  if (!reviewToken) {
    return NextResponse.json({ error: "Invalid or unknown token." }, { status: 403 });
  }

  if (reviewToken.submissionId) {
    return NextResponse.json({ error: "This link has already been used." }, { status: 409 });
  }

  if (reviewToken.expiresAt && new Date() > reviewToken.expiresAt) {
    return NextResponse.json({ error: "This link has expired." }, { status: 410 });
  }

  // Create submission and link it to the token
  const feedbackRepo = getFeedbackRepository();
  const submission = await feedbackRepo.create({
    responses: result.data.responses.map((r) => ({
      questionKey: r.questionKey,
      value: r.value.trim(),
    })),
  });

  await tokenRepo.markSubmitted(result.data.token, submission.id);

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
