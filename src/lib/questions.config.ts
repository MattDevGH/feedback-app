// Question bank — edit this file to change questions, add new ones, or adjust
// mandatory status. The UI and validation derive entirely from this config;
// no other files need to change when questions are updated.
//
// category:  drives colour-coding and section completion logic
//   "praise"     — things this person does well (continue doing)
//   "criticism"  — things this person struggles with (stop doing / do less)
//   "suggestion" — things this person should start doing or develop
//
// mandatory: if true, this question must be answered for its section to be complete.
//            if no mandatory questions exist in a section, at least one answer is required.
//
// displayOrder: controls the order questions are rendered in the UI.

export type Category = "praise" | "criticism" | "suggestion";

export type Question = {
  key: string;
  category: Category;
  text: string;
  placeholder?: string;
  mandatory: boolean;
  displayOrder: number;
};

export const QUESTIONS: Question[] = [
  {
    key: "praise-1",
    category: "praise",
    text: "What does this person do well?",
    placeholder: "e.g. clear communicator, reliable under pressure…",
    mandatory: true,
    displayOrder: 1,
  },
  {
    key: "praise-2",
    category: "praise",
    text: "Can you describe a specific example of them at their best?",
    placeholder: "e.g. how they handled a particular situation…",
    mandatory: false,
    displayOrder: 2,
  },
  {
    key: "criticism-1",
    category: "criticism",
    text: "What does this person struggle with?",
    placeholder: "e.g. tends to take on too much without delegating…",
    mandatory: true,
    displayOrder: 3,
  },
  {
    key: "criticism-2",
    category: "criticism",
    text: "Has there been a situation where they could have handled things better?",
    placeholder: "e.g. a specific instance where a different approach would have helped…",
    mandatory: false,
    displayOrder: 4,
  },
  {
    key: "suggestion-1",
    category: "suggestion",
    text: "What should this person start doing or do more of?",
    placeholder: "e.g. seek feedback more regularly, share context earlier…",
    mandatory: true,
    displayOrder: 5,
  },
  {
    key: "suggestion-2",
    category: "suggestion",
    text: "Is there a skill or behaviour you'd encourage them to develop?",
    placeholder: "e.g. public speaking, stakeholder management…",
    mandatory: false,
    displayOrder: 6,
  },
];

// Visual config per category — used by the UI for colour-coding.
export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; borderColor: string; badgeColor: string }
> = {
  praise: {
    label: "Praise",
    color: "text-emerald-700",
    borderColor: "border-emerald-400",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  criticism: {
    label: "Criticism",
    color: "text-red-700",
    borderColor: "border-red-400",
    badgeColor: "bg-red-100 text-red-700",
  },
  suggestion: {
    label: "Suggestion",
    color: "text-blue-700",
    borderColor: "border-blue-400",
    badgeColor: "bg-blue-100 text-blue-700",
  },
};

// Returns all unique categories present in the question bank, in a stable order.
export const CATEGORIES: Category[] = ["praise", "criticism", "suggestion"];

// Section completion logic — used by both the UI and API validation.
// A section is complete when:
//   - if mandatory questions exist: all mandatory questions have a non-empty answer
//   - if no mandatory questions exist: at least one question has a non-empty answer
export function isSectionComplete(category: Category, answers: Record<string, string>): boolean {
  const sectionQuestions = QUESTIONS.filter((q) => q.category === category);
  const mandatoryQuestions = sectionQuestions.filter((q) => q.mandatory);

  if (mandatoryQuestions.length > 0) {
    return mandatoryQuestions.every((q) => (answers[q.key] ?? "").trim() !== "");
  }

  return sectionQuestions.some((q) => (answers[q.key] ?? "").trim() !== "");
}

export function isFormComplete(answers: Record<string, string>): boolean {
  return CATEGORIES.every((category) => isSectionComplete(category, answers));
}
