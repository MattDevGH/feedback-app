import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type {
  CreateTokenData,
  RequestTokenData,
  ReviewToken,
  TokenRepository,
  TokenStatus,
} from "./token.repository";

function toReviewToken(record: {
  id: string;
  token: string;
  name: string;
  message: string | null;
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

  async createRequest(data: RequestTokenData): Promise<ReviewToken> {
    const record = await prisma.reviewToken.create({
      data: {
        token: crypto.randomBytes(32).toString("hex"),
        name: data.name,
        message: data.message,
        status: "requested",
      },
    });
    return toReviewToken(record);
  }

  async findByToken(token: string): Promise<ReviewToken | null> {
    const record = await prisma.reviewToken.findUnique({ where: { token } });
    return record ? toReviewToken(record) : null;
  }

  async findById(id: string): Promise<ReviewToken | null> {
    const record = await prisma.reviewToken.findUnique({ where: { id } });
    return record ? toReviewToken(record) : null;
  }

  async approve(id: string): Promise<ReviewToken> {
    const record = await prisma.reviewToken.update({
      where: { id },
      data: { status: "pending" },
    });
    return toReviewToken(record);
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

  async countByStatus(status: TokenStatus): Promise<number> {
    return prisma.reviewToken.count({ where: { status } });
  }

  async findAll(): Promise<ReviewToken[]> {
    const records = await prisma.reviewToken.findMany({ orderBy: { createdAt: "desc" } });
    return records.map(toReviewToken);
  }
}
