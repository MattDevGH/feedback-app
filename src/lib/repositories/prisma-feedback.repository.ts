import { prisma } from "@/lib/prisma";
import type {
  CreateSubmissionData,
  FeedbackSubmission,
  FeedbackRepository,
} from "./feedback.repository";

export class PrismaFeedbackRepository implements FeedbackRepository {
  async create(data: CreateSubmissionData): Promise<FeedbackSubmission> {
    return prisma.feedbackSubmission.create({
      data: {
        responses: {
          create: data.responses.map((r) => ({
            questionKey: r.questionKey,
            value: r.value,
          })),
        },
      },
      include: { responses: true },
    });
  }

  async findAll(): Promise<FeedbackSubmission[]> {
    return prisma.feedbackSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      include: { responses: true },
    });
  }
}
