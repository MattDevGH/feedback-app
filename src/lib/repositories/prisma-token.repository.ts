import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type {
  CreateTokenData,
  ReviewToken,
  TokenRepository,
  TokenStatus,
} from "./token.repository";

function toReviewToken(record: {
  id: string;
  token: string;
  name: string;
  status: string;
  createdAt: Date;
  usedAt: Date | null;
  expiresAt: Date | null;
  submissionId: string | null;
}): ReviewToken {
  return {
    ...record,
    status: record.status as TokenStatus,
  };
}

export class PrismaTokenRepository implements TokenRepository {
  async create(data: CreateTokenData): Promise<ReviewToken> {
    const record = await prisma.reviewToken.create({
      data: {
        token: crypto.randomBytes(32).toString("hex"),
        name: data.name,
        expiresAt: data.expiresAt ?? null,
      },
    });
    return toReviewToken(record);
  }

  async findByToken(token: string): Promise<ReviewToken | null> {
    const record = await prisma.reviewToken.findUnique({ where: { token } });
    return record ? toReviewToken(record) : null;
  }

  async markSubmitted(token: string, submissionId: string): Promise<ReviewToken> {
    const record = await prisma.reviewToken.update({
      where: { token },
      data: { status: "submitted", submissionId, usedAt: new Date() },
    });
    return toReviewToken(record);
  }

  async markAnonymous(token: string): Promise<ReviewToken> {
    const record = await prisma.reviewToken.update({
      where: { token },
      data: { status: "anonymous", usedAt: new Date() },
    });
    return toReviewToken(record);
  }

  async findAll(): Promise<ReviewToken[]> {
    const records = await prisma.reviewToken.findMany({ orderBy: { createdAt: "desc" } });
    return records.map(toReviewToken);
  }
}
