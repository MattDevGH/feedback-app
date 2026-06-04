"use client";

import { useState } from "react";
import {
  QUESTIONS,
  CATEGORIES,
  CATEGORY_CONFIG,
  isSectionComplete,
  isFormComplete,
  type Category,
} from "@/lib/questions.config";

type Status = "idle" | "submitting" | "success" | "error";

// Sort questions by displayOrder once at module level
const orderedQuestions = [...QUESTIONS].sort((a, b) => a.displayOrder - b.displayOrder);

export default function FeedbackPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(questionKey: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    // Build responses array — only include non-empty answers
    const responses = Object.entries(answers)
      .filter(([, value]) => value.trim() !== "")
      .map(([questionKey, value]) => ({ questionKey, value }));

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed. Please try again.");
      }

      setStatus("success");
      setAnswers({});
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const formReady = isFormComplete(answers);

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">🙏</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thank you!</h1>
          <p className="text-gray-500">Your feedback has been submitted. It&apos;s really appreciated.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Share your feedback</h1>
        <p className="text-gray-500 text-sm mb-4">
          Your responses are honest and genuinely helpful. Please answer at least the
          required questions in each section.
        </p>

        {/* Section completion indicators */}
        <div className="flex gap-3 mb-8" aria-label="Section completion status">
          {CATEGORIES.map((category) => {
            const cfg = CATEGORY_CONFIG[category];
            const complete = isSectionComplete(category, answers);
            return (
              <span
                key={category}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  complete
                    ? cfg.badgeColor
                    : "bg-gray-100 text-gray-400"
                }`}
                aria-label={`${cfg.label}: ${complete ? "complete" : "incomplete"}`}
              >
                <span aria-hidden="true">{complete ? "✓" : "○"}</span>
                {cfg.label}
              </span>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6 mb-8">
            {orderedQuestions.map((question) => {
              const cfg = CATEGORY_CONFIG[question.category as Category];
              const value = answers[question.key] ?? "";
              return (
                <div
                  key={question.key}
                  className={`bg-white rounded-xl border-l-4 ${cfg.borderColor} shadow-sm p-5`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <label
                      htmlFor={question.key}
                      className="text-sm font-medium text-gray-800"
                    >
                      {question.text}
                      {question.mandatory && (
                        <span className="text-red-500 ml-1" aria-label="required">*</span>
                      )}
                    </label>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <textarea
                    id={question.key}
                    name={question.key}
                    rows={3}
                    value={value}
                    onChange={(e) => handleChange(question.key, e.target.value)}
                    placeholder={question.placeholder}
                    aria-required={question.mandatory}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              );
            })}
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-red-600 mb-4">
              {errorMessage}
            </p>
          )}

          <p className="text-xs text-gray-400 mb-3">* Required</p>

          <button
            type="submit"
            disabled={status === "submitting" || !formReady}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "submitting" ? "Submitting…" : "Submit feedback"}
          </button>
        </form>
      </div>
    </main>
  );
}
