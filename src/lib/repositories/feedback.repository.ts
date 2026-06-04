// Domain types for feedback submissions.
// All repository implementations must return these shapes.

export type FeedbackResponse = {
  id: string;
  questionKey: string;
  value: string;
};

export type FeedbackSubmission = {
  id: string;
  submittedAt: Date;
  responses: FeedbackResponse[];
};

// A response to a single question within a submission.
export type CreateResponseData = {
  questionKey: string;
  value: string;
};

export type CreateSubmissionData = {
  responses: CreateResponseData[];
};

// The contract that all persistence implementations must satisfy.
// Application code depends only on this interface.
export interface FeedbackRepository {
  create(data: CreateSubmissionData): Promise<FeedbackSubmission>;
  findAll(): Promise<FeedbackSubmission[]>;
}
