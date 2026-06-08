import { NextResponse } from "next/server";
import { z } from "zod";
import { getTokenRepository } from "@/lib/repositories";

const anonymousSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// POST /api/feedback/anonymous — mark a token as anonymously submitted
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = anonymousSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const tokenRepo = getTokenRepository();
  const reviewToken = await tokenRepo.findByToken(parsed.data.token);

  if (!reviewToken) {
    return NextResponse.json({ error: "Invalid or unknown token." }, { status: 403 });
  }

  if (reviewToken.status !== "pending") {
    return NextResponse.json({ error: "This link has already been used." }, { status: 409 });
  }

  if (reviewToken.expiresAt && new Date() > reviewToken.expiresAt) {
    return NextResponse.json({ error: "This link has expired." }, { status: 410 });
  }

  await tokenRepo.markAnonymous(parsed.data.token);

  return NextResponse.json(
    { status: "anonymous", usedAt: new Date().toISOString() },
    { status: 200 },
  );
}
