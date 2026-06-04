import type {
  CreateSubmissionData,
  FeedbackSubmission,
  FeedbackRepository,
} from "./feedback.repository";

// In-memory implementation — intended for use in tests.
// Each instance starts with an empty store; pass initialData to pre-populate.
export class MemoryFeedbackRepository implements FeedbackRepository {
  private store: FeedbackSubmission[] = [];
  private nextId = 1;

  constructor(initialData: FeedbackSubmission[] = []) {
    this.store = [...initialData];
  }

  async create(data: CreateSubmissionData): Promise<FeedbackSubmission> {
    const submission: FeedbackSubmission = {
      id: `mem-${this.nextId++}`,
      submittedAt: new Date(),
      responses: data.responses.map((r, i) => ({
        id: `mem-r-${this.nextId}-${i}`,
        questionKey: r.questionKey,
        value: r.value,
      })),
    };
    this.store.unshift(submission); // newest first, matching Prisma orderBy
    return submission;
  }

  async findAll(): Promise<FeedbackSubmission[]> {
    return [...this.store];
  }
}
