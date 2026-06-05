import type { FeedbackRepository } from "./feedback.repository";
import type { TokenRepository } from "./token.repository";
import { PrismaFeedbackRepository } from "./prisma-feedback.repository";
import { PrismaTokenRepository } from "./prisma-token.repository";

export function getFeedbackRepository(): FeedbackRepository {
  return new PrismaFeedbackRepository();
}

export function getTokenRepository(): TokenRepository {
  return new PrismaTokenRepository();
}
