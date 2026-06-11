// Question bank — edit this file to change questions, add new ones, or adjust
// mandatory status. The UI and validation derive entirely from this config;
// no other files need to change when questions are updated.
//
// Questions are personalised using src/lib/profile.config.ts.
//
// category (internal):
//   "praise"     — things this person does well (continue doing)
//   "criticism"  — things this person struggles with (stop doing / do less)
//   "suggestion" — things this person should start doing or develop
//   "general"    — uncategorised feedback (not part of section completion)
//
// User-facing labels use stop/start/continue framing rather than
// praise/criticism/suggestion. "General" has no coloured label.
//
// mandatory: if true, this question must be answered for its section to be complete.
//            if no mandatory questions exist in a section, at least one answer is required.
//            "general" questions are never mandatory.
//
// displayOrder: controls the order questions are rendered in the UI.

import { PROFILE } from "./profile.config";

const { name } = PROFILE;

export type Category = "praise" | "criticism" | "suggestion" | "general";

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
    text: `What are some things ${name} does well?`,
    placeholder: "e.g. clear communicator, reliable under pressure\u2026",
    mandatory: false,
    displayOrder: 1,
  },
  {
    key: "praise-2",
    category: "praise",
    text: `What are ${name}'s key strengths?`,
    placeholder: "e.g. analytical thinking, empathy, technical depth\u2026",
    mandatory: false,
    displayOrder: 2,
  },
  {
    key: "praise-3",
    category: "praise",
    text: `What have you enjoyed about working with ${name}?`,
    placeholder:
      "e.g. collaborative problem-solving, always makes time to help, brings energy to the team\u2026",
    mandatory: false,
    displayOrder: 3,
  },
  {
    key: "praise-4",
    category: "praise",
    text: `Can you describe a specific example of ${name} at ${PROFILE.pronouns.possessive} best?`,
    placeholder: "e.g. how they handled a particular situation\u2026",
    mandatory: false,
    displayOrder: 4,
  },
  {
    key: "praise-5",
    category: "praise",
    text: `What does ${name} do that ${PROFILE.pronouns.subject} should keep doing?`,
    placeholder: "e.g. regular check-ins, thorough documentation\u2026",
    mandatory: false,
    displayOrder: 5,
  },

  // Stop (criticism) — what to do less of or differently
  {
    key: "criticism-1",
    category: "criticism",
    text: `What does ${name} struggle with?`,
    placeholder: "e.g. tends to take on too much without delegating\u2026",
    mandatory: false,
    displayOrder: 6,
  },
  {
    key: "criticism-2",
    category: "criticism",
    text: `Has there been a situation where ${name} could have handled things better?`,
    placeholder: "e.g. a specific instance where a different approach would have helped\u2026",
    mandatory: false,
    displayOrder: 7,
  },
  {
    key: "criticism-3",
    category: "criticism",
    text: `What should ${name} stop doing or do less of?`,
    placeholder: "e.g. micromanaging, over-explaining, being too cautious\u2026",
    mandatory: false,
    displayOrder: 8,
  },
  {
    key: "criticism-4",
    category: "criticism",
    text: `What behaviours or habits hold ${name} back?`,
    placeholder: "e.g. avoiding difficult conversations, being too perfectionist\u2026",
    mandatory: false,
    displayOrder: 9,
  },
  {
    key: "criticism-5",
    category: "criticism",
    text: `If you could change one thing about working with ${name}, what would it be?`,
    placeholder: "e.g. more timely responses, clearer expectations\u2026",
    mandatory: false,
    displayOrder: 10,
  },

  // Start (suggestion) — what to begin or develop
  {
    key: "suggestion-1",
    category: "suggestion",
    text: `What skills or behaviours should ${name} build on to achieve greater success in ${PROFILE.pronouns.possessive} role?`,
    placeholder: "e.g. stakeholder management, public speaking, strategic thinking\u2026",
    mandatory: false,
    displayOrder: 11,
  },
  {
    key: "suggestion-2",
    category: "suggestion",
    text: `How could ${name} improve?`,
    placeholder: "e.g. seek feedback more often, delegate more, set clearer expectations\u2026",
    mandatory: false,
    displayOrder: 12,
  },
  {
    key: "suggestion-3",
    category: "suggestion",
    text: `What training, experience, or exposure would help ${name} grow?`,
    placeholder: "e.g. leading a cross-team project, presenting to senior stakeholders\u2026",
    mandatory: false,
    displayOrder: 13,
  },
  {
    key: "suggestion-4",
    category: "suggestion",
    text: `What would make ${name} more effective in ${PROFILE.pronouns.possessive} role?`,
    placeholder: "e.g. better tooling, more context from leadership, clearer priorities\u2026",
    mandatory: false,
    displayOrder: 14,
  },
  {
    key: "suggestion-5",
    category: "suggestion",
    text: `What doesn't ${name} do that ${PROFILE.pronouns.subject} should start doing?`,
    placeholder: "e.g. proactively sharing updates, mentoring others\u2026",
    mandatory: false,
    displayOrder: 15,
  },

  // General — uncategorised, not part of section completion
  {
    key: "general-1",
    category: "general",
    text: `Any other comments?  Please also use this question to provide any feedback about this feedback tool.`,
    placeholder:
      "Anything else you'd like to share \u2014 positive, constructive, or otherwise\u2026",
    mandatory: false,
    displayOrder: 16,
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
  general: {
    label: "General",
    color: "text-gray-600",
    borderColor: "border-gray-300",
    badgeColor: "bg-gray-100 text-gray-600",
  },
};

// Categories that participate in section completion logic.
// "general" is excluded — it's optional and doesn't block form submission.
export const CATEGORIES: Category[] = ["praise", "criticism", "suggestion"];

// Section completion logic — used by both the UI and API validation.
// A section is complete when:
//   - if mandatory questions exist: all mandatory questions have a non-empty answer
//   - if no mandatory questions exist: at least one question has a non-empty answer
// "general" category questions are never checked.
export function isSectionComplete(category: Category, answers: Record<string, string>): boolean {
  if (category === "general") return true;

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
