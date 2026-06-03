import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const feedback = await prisma.feedback.create({
    data: {
      strengths: strengths.trim(),
      improvements: improvements.trim(),
    },
  });

  return NextResponse.json(feedback, { status: 201 });
}

// GET /api/feedback — retrieve all feedback (admin use)
export async function GET() {
  const feedback = await prisma.feedback.findMany({
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json(feedback);
}
