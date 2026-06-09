import { NextResponse } from "next/server";
import { getTokenRepository } from "@/lib/repositories";

type Params = { params: Promise<{ id: string }> };

// POST /api/tokens/[id]/approve — admin-only, changes "requested" → "pending"
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const repo = getTokenRepository();
  const token = await repo.findById(id);

  if (!token) {
    return NextResponse.json({ error: "Token not found." }, { status: 404 });
  }

  if (token.status !== "requested") {
    return NextResponse.json(
      { error: "Only tokens with status 'requested' can be approved." },
      { status: 409 },
    );
  }

  const approved = await repo.approve(id);
  return NextResponse.json(approved, { status: 200 });
}
