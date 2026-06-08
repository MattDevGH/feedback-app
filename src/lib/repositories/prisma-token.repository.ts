import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { CreateTokenData, ReviewToken, TokenRepository } from "./token.repository";

export class PrismaTokenRepository implements TokenRepository {
  async create(data: CreateTokenData): Promise<ReviewToken> {
    return prisma.reviewToken.create({
      data: {
        token: crypto.randomBytes(32).toString("hex"),
        name: data.name,
        expiresAt: data.expiresAt ?? null,
      },
    }) as Promise<ReviewToken>;
  }

  async findByToken(token: string): Promise<ReviewToken | null> {
    return prisma.reviewToken.findUnique({ where: { token } }) as Promise<ReviewToken | null>;
  }

  async markSubmitted(token: string, submissionId: string): Promise<ReviewToken> {
    return prisma.reviewToken.update({
      where: { token },
      data: { status: "submitted", submissionId, usedAt: new Date() },
    }) as Promise<ReviewToken>;
  }

  async markAnonymous(token: string): Promise<ReviewToken> {
    return prisma.reviewToken.update({
      where: { token },
      data: { status: "anonymous", usedAt: new Date() },
    }) as Promise<ReviewToken>;
  }

  async findAll(): Promise<ReviewToken[]> {
    return prisma.reviewToken.findMany({ orderBy: { createdAt: "desc" } }) as Promise<
      ReviewToken[]
    >;
  }
}
