// Question bank — edit this file to change questions, add new ones, or adjust
// mandatory status. The UI and validation derive entirely from this config;
// no other files need to change when questions are updated.
//
// category (internal):
//   "praise"     — things this person does well (continue doing)
//   "criticism"  — things this person struggles with (stop doing / do less)
//   "suggestion" — things this person should start doing or develop
//
// User-facing labels use the stop/start/continue framing rather than
// praise/criticism/suggestion — it's more action-oriented and less awkward.
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
  // Continue (praise) — what to keep doing
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
    key: "praise-3",
    category: "praise",
    text: "What should this person continue doing?",
    placeholder: "e.g. the way they run meetings, their approach to code review…",
    mandatory: false,
    displayOrder: 3,
  },

  // Stop (criticism) — what to do less of or differently
  {
    key: "criticism-1",
    category: "criticism",
    text: "What does this person struggle with?",
    placeholder: "e.g. tends to take on too much without delegating…",
    mandatory: true,
    displayOrder: 4,
  },
  {
    key: "criticism-2",
    category: "criticism",
    text: "Has there been a situation where they could have handled things better?",
    placeholder: "e.g. a specific instance where a different approach would have helped…",
    mandatory: false,
    displayOrder: 5,
  },
  {
    key: "criticism-3",
    category: "criticism",
    text: "What should this person stop doing or do less of?",
    placeholder: "e.g. micromanaging, over-explaining, being too cautious…",
    mandatory: false,
    displayOrder: 6,
  },

  // Start (suggestion) — what to begin or develop
  {
    key: "suggestion-1",
    category: "suggestion",
    text: "What should this person start doing or do more of?",
    placeholder: "e.g. seek feedback more regularly, share context earlier…",
    mandatory: true,
    displayOrder: 7,
  },
  {
    key: "suggestion-2",
    category: "suggestion",
    text: "Is there a skill or behaviour you'd encourage them to develop?",
    placeholder: "e.g. public speaking, stakeholder management…",
    mandatory: false,
    displayOrder: 8,
  },
  {
    key: "suggestion-3",
    category: "suggestion",
    text: "What should this person start doing?",
    placeholder: "e.g. delegating more, saying no, celebrating team wins…",
    mandatory: false,
    displayOrder: 9,
  },
];

// Visual config per category — user-facing labels use stop/start/continue framing.
export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; borderColor: string; badgeColor: string }
> = {
  praise: {
    label: "Continue",
    color: "text-emerald-700",
    borderColor: "border-emerald-400",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  criticism: {
    label: "Stop",
    color: "text-red-700",
    borderColor: "border-red-400",
    badgeColor: "bg-red-100 text-red-700",
  },
  suggestion: {
    label: "Start",
    color: "text-blue-700",
    borderColor: "border-blue-400",
    badgeColor: "bg-blue-100 text-blue-700",
  },
};

// All categories in display order.
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
