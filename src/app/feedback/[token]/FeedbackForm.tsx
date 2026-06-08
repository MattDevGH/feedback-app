"use client";

import { useState } from "react";
import {
  QUESTIONS,
  CATEGORIES,
  CATEGORY_CONFIG,
  isSectionComplete,
  type Category,
} from "@/lib/questions.config";
import { PROFILE } from "@/lib/profile.config";
import { useFeedbackForm } from "@/app/hooks/useFeedbackForm";

const orderedQuestions = [...QUESTIONS].sort((a, b) => a.displayOrder - b.displayOrder);
const MAILTO_SAFE_LENGTH = 1500;

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
          Your responses are honest and genuinely helpful. Please answer at least the required
          questions in each section.
        </p>

        <SectionIndicators answers={answers} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <div className="space-y-6 mb-8">
            {orderedQuestions.map((question) => {
              const categoryStyle = CATEGORY_CONFIG[question.category as Category];
              return (
                <div
                  key={question.key}
                  className={`bg-white rounded-xl border-l-4 ${categoryStyle.borderColor} shadow-sm p-5`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <label htmlFor={question.key} className="text-sm font-medium text-gray-800">
                      {question.text}
                      {question.mandatory && (
                        <span className="text-red-500 ml-1" aria-label="required">
                          *
                        </span>
                      )}
                    </label>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${categoryStyle.badgeColor}`}
                    >
                      {categoryStyle.label}
                    </span>
                  </div>
                  <textarea
                    id={question.key}
                    name={question.key}
                    rows={3}
                    value={answers[question.key] ?? ""}
                    onChange={(e) => updateAnswer(question.key, e.target.value)}
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
            disabled={status === "submitting" || !isReady}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "submitting" ? "Submitting…" : "Submit feedback"}
          </button>

          {isReady && (
            <button
              type="button"
              onClick={() => setView("anonymous-confirm")}
              className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Or submit anonymously →
            </button>
          )}
        </form>
      </div>
    </main>
  );
}

function AnonymousConfirmView({
  answers,
  token,
  onBack,
  onDone,
}: {
  answers: Record<string, string>;
  token: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const feedbackSummary = buildFeedbackSummary(answers);
  const mailtoUrl = buildMailtoUrl(feedbackSummary);
  const contentTooLong = feedbackSummary.length > MAILTO_SAFE_LENGTH;

  async function handleMailtoClick() {
    // Mark the token as anonymously used
    await fetch("/api/feedback/anonymous", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    // Clear localStorage draft
    localStorage.removeItem(`feedback-draft-${token}`);
    onDone();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Submit anonymously</h1>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 mb-2">
            <strong>How this works:</strong> Your feedback will be emailed to{" "}
            {PROFILE.lineManager.name}, who will collate and share it with {PROFILE.name} without
            reference to your identity.
          </p>
          <p className="text-sm text-amber-800 mb-2">
            This is <strong>indirect</strong> rather than truly anonymous —{" "}
            {PROFILE.lineManager.name} will know the feedback came via this app, but {PROFILE.name}{" "}
            won't know who submitted it.
          </p>
          <p className="text-xs text-amber-700">
            ⚠️ Your responses will not be saved in the app. Once you proceed, you won't be able to
            return here to view them. Refer to your sent email or save a copy below.
          </p>
        </div>

        {/* Copyable summary */}
        <label htmlFor="feedback-summary" className="block text-xs font-medium text-gray-500 mb-2">
          Your feedback (copy for your records):
        </label>
        <textarea
          id="feedback-summary"
          readOnly
          rows={10}
          value={feedbackSummary}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 bg-gray-50 resize-none mb-6 font-mono"
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />

        {contentTooLong && (
          <p className="text-xs text-gray-500 mb-4">
            Your feedback is too long to include in the email link automatically. Please copy the
            text above and paste it into the email.
          </p>
        )}

        <a
          href={mailtoUrl}
          onClick={handleMailtoClick}
          className="block w-full text-center bg-indigo-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {contentTooLong ? "Open email (paste feedback yourself)" : "Open email with feedback"}
        </a>

        <button
          onClick={onBack}
          className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Go back to form
        </button>
      </div>
    </main>
  );
}

function AnonymousDone() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          🙏
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thank you!</h1>
        <p className="text-gray-500 mb-2">
          Please send the email that just opened in your email client.
        </p>
        <p className="text-xs text-gray-400">Your feedback has not been stored in the app.</p>
      </div>
    </main>
  );
}

function ThankYou() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">
          🙏
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thank you!</h1>
        <p className="text-gray-500">
          Your feedback has been submitted. It&apos;s really appreciated.
        </p>
      </div>
    </main>
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
            <span aria-hidden="true">{complete ? "✓" : "○"}</span>
            {categoryStyle.label}
          </span>
        );
      })}
    </div>
  );
}

function buildFeedbackSummary(answers: Record<string, string>): string {
  const lines: string[] = [];
  for (const question of orderedQuestions) {
    const answer = (answers[question.key] ?? "").trim();
    if (!answer) continue;
    lines.push(`${question.text}\n${answer}\n`);
  }
  return lines.join("\n");
}

function buildMailtoUrl(summary: string): string {
  const subject = `Anonymous feedback for ${PROFILE.name}`;
  const contentFits = summary.length <= MAILTO_SAFE_LENGTH;
  const body = contentFits
    ? `Hi ${PROFILE.lineManager.name},\n\nPlease find anonymous feedback for ${PROFILE.name} below:\n\n${summary}\nPlease share this with ${PROFILE.name} without reference to who submitted it.\n\nThank you.`
    : `Hi ${PROFILE.lineManager.name},\n\nSomeone has submitted anonymous feedback for ${PROFILE.name} via the feedback app.\n\nPlease paste the feedback content here (it was too long to include automatically):\n\n[PASTE FEEDBACK HERE]\n\nPlease share this with ${PROFILE.name} without reference to who submitted it.\n\nThank you.`;

  return `mailto:${PROFILE.lineManager.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
