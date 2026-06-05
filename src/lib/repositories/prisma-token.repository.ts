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
    });
  }

  async findByToken(token: string): Promise<ReviewToken | null> {
    return prisma.reviewToken.findUnique({ where: { token } });
  }

  async markSubmitted(token: string, submissionId: string): Promise<ReviewToken> {
    return prisma.reviewToken.update({
      where: { token },
      data: { submissionId },
    });
  }

  async findAll(): Promise<ReviewToken[]> {
    return prisma.reviewToken.findMany({ orderBy: { createdAt: "desc" } });
  }
}
