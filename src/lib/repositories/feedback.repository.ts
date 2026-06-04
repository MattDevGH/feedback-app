// The shared Feedback type used across the application.
// Matches the shape Prisma returns — when swapping implementations,
// all repositories must return this same shape.
export type Feedback = {
  id: string;
  strengths: string;
  improvements: string;
  submittedAt: Date;
};

export type CreateFeedbackData = {
  strengths: string;
  improvements: string;
};

// The contract that all persistence implementations must satisfy.
// Application code depends only on this interface, never on a
// concrete implementation directly.
export interface FeedbackRepository {
  create(data: CreateFeedbackData): Promise<Feedback>;
  findAll(): Promise<Feedback[]>;
}
