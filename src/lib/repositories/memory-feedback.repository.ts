import type { CreateFeedbackData, Feedback, FeedbackRepository } from "./feedback.repository";

// In-memory implementation — intended for use in tests.
// Each instance starts with an empty store; inject a pre-populated
// instance to test read paths.
export class MemoryFeedbackRepository implements FeedbackRepository {
  private store: Feedback[] = [];
  private nextId = 1;

  constructor(initialData: Feedback[] = []) {
    this.store = [...initialData];
  }

  async create(data: CreateFeedbackData): Promise<Feedback> {
    const feedback: Feedback = {
      id: `mem-${this.nextId++}`,
      strengths: data.strengths,
      improvements: data.improvements,
      submittedAt: new Date(),
    };
    this.store.unshift(feedback); // newest first, matching Prisma's orderBy
    return feedback;
  }

  async findAll(): Promise<Feedback[]> {
    return [...this.store];
  }
}
