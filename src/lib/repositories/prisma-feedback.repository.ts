import { prisma } from "@/lib/prisma";
import type { CreateFeedbackData, Feedback, FeedbackRepository } from "./feedback.repository";

export class PrismaFeedbackRepository implements FeedbackRepository {
  async create(data: CreateFeedbackData): Promise<Feedback> {
    return prisma.feedback.create({ data });
  }

  async findAll(): Promise<Feedback[]> {
    return prisma.feedback.findMany({
      orderBy: { submittedAt: "desc" },
    });
  }
}
