import { z } from "zod";
import { QUESTIONS, CATEGORIES, isSectionComplete } from "@/lib/questions.config";

const validQuestionKeys = QUESTIONS.map((q) => q.key);
const MAX_FIELD_LENGTH = 2000;

const responseSchema = z.object({
  questionKey: z.string().refine((key) => validQuestionKeys.includes(key), {
    message: "Unknown question key",
  }),
  value: z
    .string()
    .min(1, "Must not be empty")
    .max(MAX_FIELD_LENGTH, `Must be ${MAX_FIELD_LENGTH} characters or fewer`)
    .refine((v) => v.trim().length > 0, { message: "Must not be blank whitespace" }),
});

const submissionSchema = z.object({
  responses: z.array(responseSchema).min(1, "At least one response is required"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export type ValidationResult =
  | { success: true; data: SubmissionInput }
  | { success: false; error: string; incompleteSections?: string[] };

export function validateSubmission(body: unknown): ValidationResult {
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { success: false, error: firstIssue.message };
  }

  const answers: Record<string, string> = {};
  for (const r of parsed.data.responses) {
    answers[r.questionKey] = r.value;
  }

  const incompleteSections = CATEGORIES.filter((category) => !isSectionComplete(category, answers));

  if (incompleteSections.length > 0) {
    return {
      success: false,
      error: `Incomplete sections: ${incompleteSections.join(", ")}. Each section requires at least the mandatory questions to be answered.`,
      incompleteSections,
    };
  }

  return { success: true, data: parsed.data };
}
