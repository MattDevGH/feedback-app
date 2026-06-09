"use client";

import { useState } from "react";
import {
  QUESTIONS,
  CATEGORIES,
  CATEGORY_CONFIG,
  isSectionComplete,
  type Category,
} from "@/lib/questions.config";
import { useFeedbackForm } from "@/app/hooks/useFeedbackForm";
import AnonymousConfirmView from "./AnonymousConfirmView";

const orderedQuestions = [...QUESTIONS].sort((a, b) => a.displayOrder - b.displayOrder);

type View = "form" | "anonymous-confirm" | "anonymous-done";

export default function FeedbackForm({ token }: { token: string }) {
  const { answers, status, errorMessage, isReady, updateAnswer, submit } = useFeedbackForm(token);
  const [view, setView] = useState<View>("form");

  if (status === "success") {
    return <ThankYou />;
  }

  if (view === "anonymous-confirm") {
    return (
      <AnonymousConfirmView
        answers={answers}
        token={token}
        onBack={() => setView("form")}
        onDone={() => setView("anonymous-done")}
      />
    );
  }

  if (view === "anonymous-done") {
    return <AnonymousDone />;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Share your feedback</h1>
        <p className="text-gray-500 text-sm mb-4">
          Please answer as many of the questions below as you like &mdash; but at minimum one from
          each section.
        </p>

        <SectionIndicators answers={answers} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <QuestionGroups answers={answers} onAnswerChange={updateAnswer} />

          {status === "error" && (
            <p role="alert" className="text-sm text-red-600 mb-4">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || !isReady}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "submitting" ? "Submitting\u2026" : "Submit feedback"}
          </button>

          {isReady && (
            <button
              type="button"
              onClick={() => setView("anonymous-confirm")}
              className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {"Or submit anonymously \u2192"}
            </button>
          )}
        </form>
      </div>
    </main>
  );
}

function ThankYou() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          &#128591;
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thank you!</h1>
        <p className="text-gray-500">
          Your feedback has been submitted. It&apos;s really appreciated.
        </p>
      </div>
    </main>
  );
}

function AnonymousDone() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          &#128591;
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thank you!</h1>
        <p className="text-gray-500 mb-2">Your anonymous feedback has been finalised.</p>
        <p className="text-xs text-gray-400">
          Please ensure you send the email if you haven&apos;t already. Your feedback has not been
          stored in the app.
        </p>
      </div>
    </main>
  );
}

function QuestionGroups({
  answers,
  onAnswerChange,
}: {
  answers: Record<string, string>;
  onAnswerChange: (key: string, value: string) => void;
}) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  function toggleQuestion(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  // Auto-expand questions that already have answers (e.g. from draft)
  const effectiveExpanded = new Set(expandedKeys);
  for (const q of orderedQuestions) {
    if ((answers[q.key] ?? "").trim() !== "") {
      effectiveExpanded.add(q.key);
    }
  }

  const allCategories: Category[] = [...CATEGORIES, "general"];

  return (
    <div className="space-y-8 mb-8">
      {allCategories.map((category) => {
        const categoryStyle = CATEGORY_CONFIG[category];
        const categoryQuestions = orderedQuestions.filter((q) => q.category === category);
        if (categoryQuestions.length === 0) return null;

        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${categoryStyle.color}`}
              >
                {categoryStyle.label}
              </span>
              {category !== "general" && (
                <span className="text-xs text-gray-400">
                  {isSectionComplete(category, answers)
                    ? "\u2713 complete"
                    : "(answer at least one)"}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {categoryQuestions.map((question) => {
                const isExpanded = effectiveExpanded.has(question.key);
                const hasAnswer = (answers[question.key] ?? "").trim() !== "";

                return (
                  <div
                    key={question.key}
                    className={`bg-white rounded-xl border-l-4 ${categoryStyle.borderColor} shadow-sm overflow-hidden`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleQuestion(question.key)}
                      className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-2"
                      aria-expanded={isExpanded}
                      aria-controls={`answer-${question.key}`}
                    >
                      <span className="text-sm text-gray-800">
                        {question.text}
                        {hasAnswer && (
                          <span className="ml-2 text-emerald-500 text-xs" aria-hidden="true">
                            {"\u2713"}
                          </span>
                        )}
                      </span>
                      <span className="text-gray-400 text-xs shrink-0" aria-hidden="true">
                        {isExpanded ? "\u25B2" : "\u25BC"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div id={`answer-${question.key}`} className="px-5 pb-4">
                        <textarea
                          id={question.key}
                          name={question.key}
                          rows={3}
                          value={answers[question.key] ?? ""}
                          onChange={(e) => onAnswerChange(question.key, e.target.value)}
                          placeholder={question.placeholder}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SectionIndicators({ answers }: { answers: Record<string, string> }) {
  return (
    <div className="flex gap-3 mb-8" aria-label="Section completion status">
      {CATEGORIES.map((category) => {
        const categoryStyle = CATEGORY_CONFIG[category];
        const complete = isSectionComplete(category, answers);
        return (
          <span
            key={category}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              complete ? categoryStyle.badgeColor : "bg-gray-100 text-gray-400"
            }`}
            aria-label={`${categoryStyle.label}: ${complete ? "complete" : "incomplete"}`}
          >
            <span aria-hidden="true">{complete ? "\u2713" : "\u25CB"}</span>
            {categoryStyle.label}
          </span>
        );
      })}
    </div>
  );
}
