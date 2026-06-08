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
    placeholder: "e.g. clear communicator, reliable under pressure…",
    mandatory: true,
    displayOrder: 1,
  },
  {
    key: "praise-2",
    category: "praise",
    text: `What are ${name}'s key strengths?`,
    placeholder: "e.g. analytical thinking, empathy, technical depth…",
    mandatory: false,
    displayOrder: 2,
  },
  {
    key: "praise-3",
    category: "praise",
    text: `What is ${name} great at?`,
    placeholder: "e.g. running meetings, unblocking others, code review…",
    mandatory: false,
    displayOrder: 3,
  },
  {
    key: "praise-4",
    category: "praise",
    text: `Can you describe a specific example of ${name} at ${PROFILE.pronouns.possessive} best?`,
    placeholder: "e.g. how they handled a particular situation…",
    mandatory: false,
    displayOrder: 4,
  },
  {
    key: "praise-5",
    category: "praise",
    text: `What should ${name} continue doing?`,
    placeholder: "e.g. the way they run standups, their approach to mentoring…",
    mandatory: false,
    displayOrder: 5,
  },

  // Stop (criticism) — what to do less of or differently
  {
    key: "criticism-1",
    category: "criticism",
    text: `What does ${name} struggle with?`,
    placeholder: "e.g. tends to take on too much without delegating…",
    mandatory: true,
    displayOrder: 6,
  },
  {
    key: "criticism-2",
    category: "criticism",
    text: `Has there been a situation where ${name} could have handled things better?`,
    placeholder: "e.g. a specific instance where a different approach would have helped…",
    mandatory: false,
    displayOrder: 7,
  },
  {
    key: "criticism-3",
    category: "criticism",
    text: `What should ${name} stop doing or do less of?`,
    placeholder: "e.g. micromanaging, over-explaining, being too cautious…",
    mandatory: false,
    displayOrder: 8,
  },

  // Start (suggestion) — what to begin or develop
  {
    key: "suggestion-1",
    category: "suggestion",
    text: `What skills or behaviours should ${name} build on to achieve greater success in ${PROFILE.pronouns.possessive} role?`,
    placeholder: "e.g. stakeholder management, public speaking, strategic thinking…",
    mandatory: true,
    displayOrder: 9,
  },
  {
    key: "suggestion-2",
    category: "suggestion",
    text: `How could ${name} improve?`,
    placeholder: "e.g. seek feedback more often, delegate more, set clearer expectations…",
    mandatory: false,
    displayOrder: 10,
  },
  {
    key: "suggestion-3",
    category: "suggestion",
    text: `What should ${name} start doing?`,
    placeholder: "e.g. delegating more, saying no, celebrating team wins…",
    mandatory: false,
    displayOrder: 11,
  },
  {
    key: "suggestion-4",
    category: "suggestion",
    text: `What should ${name} start doing or do more of?`,
    placeholder: "e.g. seek feedback more regularly, share context earlier…",
    mandatory: false,
    displayOrder: 12,
  },

  // General — uncategorised, not part of section completion
  {
    key: "general-1",
    category: "general",
    text: `Any other feedback for ${name}?`,
    placeholder: "Anything else you'd like to share — positive, constructive, or otherwise…",
    mandatory: false,
    displayOrder: 13,
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
