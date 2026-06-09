import { NextResponse } from "next/server";
import { z } from "zod";
import { getTokenRepository } from "@/lib/repositories";

const MAX_PENDING_REQUESTS = 10;

const requestSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .refine((v) => v.trim().length > 0, { message: "Name must not be blank" }),
  message: z
    .string()
    .min(1, "Message is required")
    .max(100, "Message must be 100 characters or fewer"),
});

// POST /api/tokens/request — public, creates a token with status "requested"
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const repo = getTokenRepository();

  // Check cap on pending requests
  const requestedCount = await repo.countByStatus("requested");
  if (requestedCount >= MAX_PENDING_REQUESTS) {
    return NextResponse.json(
      { error: "Too many feedback offers are waiting for approval. Please try again later." },
      { status: 503 },
    );
  }

  const token = await repo.createRequest({
    name: parsed.data.name.trim(),
    message: parsed.data.message.trim(),
  });

  return NextResponse.json(token, { status: 201 });
}
