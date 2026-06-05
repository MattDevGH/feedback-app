import { NextResponse } from "next/server";
import { z } from "zod";
import { getTokenRepository } from "@/lib/repositories";

const createTokenSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .refine((v) => v.trim().length > 0, {
      message: "Name must not be blank",
    }),
  expiresAt: z.coerce.date().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const repo = getTokenRepository();
  const token = await repo.create({
    name: parsed.data.name.trim(),
    expiresAt: parsed.data.expiresAt,
  });

  return NextResponse.json(token, { status: 201 });
}

export async function GET() {
  const repo = getTokenRepository();
  const tokens = await repo.findAll();
  return NextResponse.json(tokens);
}
