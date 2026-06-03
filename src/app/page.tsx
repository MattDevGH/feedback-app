"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function FeedbackPage() {
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strengths, improvements }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed. Please try again.");
      }

      setStatus("success");
      setStrengths("");
      setImprovements("");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">🙏</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thank you!</h1>
          <p className="text-gray-500">Your feedback has been submitted. It&apos;s really appreciated.</p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-6 text-sm text-indigo-600 hover:underline"
          >
            Submit more feedback
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Share your feedback</h1>
        <p className="text-gray-500 text-sm mb-8">
          Your responses are anonymous and genuinely helpful. Be honest!
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label
              htmlFor="strengths"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What does this person do well?
            </label>
            <textarea
              id="strengths"
              name="strengths"
              rows={4}
              required
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="e.g. clear communicator, reliable in a crisis…"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="improvements"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What could this person do to improve?
            </label>
            <textarea
              id="improvements"
              name="improvements"
              rows={4}
              required
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="e.g. delegate more, give earlier notice on changes…"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-red-600 mb-4">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || strengths.trim() === "" || improvements.trim() === ""}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "submitting" ? "Submitting…" : "Submit feedback"}
          </button>
        </form>
      </div>
    </main>
  );
}
