import type { FeedbackRepository } from "./feedback.repository";
import { PrismaFeedbackRepository } from "./prisma-feedback.repository";

// Factory that returns the active FeedbackRepository implementation.
// Swap this function's return value to change the persistence backend
// without touching any application logic.
//
// Future implementations to add here:
//   - PostgresFeedbackRepository (Neon/Vercel Postgres)
//   - any other adapter
//
// The MemoryFeedbackRepository is not wired here — it is injected
// directly in tests.
export function getFeedbackRepository(): FeedbackRepository {
  return new PrismaFeedbackRepository();
}
