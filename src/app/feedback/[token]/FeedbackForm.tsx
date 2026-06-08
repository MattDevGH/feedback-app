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
  const [confirming, setConfirming] = useState(false);
  const [mailtoClicked, setMailtoClicked] = useState(false);
  const feedbackSummary = buildFeedbackSummary(answers);
  const mailtoUrl = buildMailtoUrl(feedbackSummary);
  const contentTooLong = feedbackSummary.length > MAILTO_SAFE_LENGTH;

  async function handleConfirmSent() {
    setConfirming(true);
    await fetch("/api/feedback/anonymous", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
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
            {PROFILE.lineManager.fullName}, who will collate and share it with {PROFILE.name}{" "}
            without reference to your identity.
          </p>
          <p className="text-sm text-amber-800 mb-2">
            This is <strong>indirect</strong> rather than truly anonymous &mdash;{" "}
            {PROFILE.lineManager.firstName} will know the feedback came via this app, but{" "}
            {PROFILE.name} won&apos;t know who submitted it.
          </p>
          <p className="text-xs text-amber-700">
            &#9888;&#65039; Your responses will not be saved in the app. Once you confirm below, you
            won&apos;t be able to return here to view them. Refer to your sent email or save a copy
            below.
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
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 bg-gray-50 resize-none mb-2 font-mono"
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <CopyButton text={feedbackSummary} />

        {contentTooLong && (
          <p className="text-xs text-gray-500 mb-4">
            Your feedback is too long to include in the email link automatically. Please copy the
            text above and paste it into the email.
          </p>
        )}

        {/* Step 1: Open email (can be clicked multiple times) */}
        <a
          href={mailtoUrl}
          onClick={() => setMailtoClicked(true)}
          className="block w-full text-center bg-indigo-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mb-3"
        >
          {contentTooLong ? "Open email (paste feedback yourself)" : "Open email with feedback"}
        </a>

        {/* Step 2: Confirm sent — only active after mailto has been clicked */}
        <button
          type="button"
          onClick={handleConfirmSent}
          disabled={!mailtoClicked || confirming}
          className={`w-full text-sm font-medium py-2.5 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
            mailtoClicked && !confirming
              ? "border-indigo-600 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
          }`}
        >
          {confirming
            ? "Finalising\u2026"
            : mailtoClicked
              ? "I\u2019ve sent it \u2014 finalise my submission"
              : "Send the email first to enable this button"}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          This will end your session and wipe your draft responses.
        </p>

        <button
          onClick={onBack}
          className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {"\u2190 Go back to form"}
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mb-6"
    >
      {copied ? "Copied!" : "Copy to clipboard"}
    </button>
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
    ? `Hi ${PROFILE.lineManager.firstName},\n\nI am submitting anonymous feedback for ${PROFILE.name} via the feedback app.\n\nPlease share this feedback with ${PROFILE.name} without revealing my identity.\n\n${summary}\nThank you.`
    : `Hi ${PROFILE.lineManager.firstName},\n\nI am submitting anonymous feedback for ${PROFILE.name} via the feedback app.\n\n[PASTE FEEDBACK HERE]\n\nPlease share this with ${PROFILE.name} without revealing my identity.\n\nThank you.`;

  return `mailto:${PROFILE.lineManager.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
