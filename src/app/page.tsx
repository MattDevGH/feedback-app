"use client";

import { useState } from "react";
import { PROFILE } from "@/lib/profile.config";

type Status = "idle" | "submitting" | "success" | "error";

export default function LandingPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedbackUrl, setFeedbackUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/tokens/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Request failed. Please try again.");
      }

      const token = await res.json();
      setFeedbackUrl(`${window.location.origin}/feedback/${token.token}`);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">
            &#9989;
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Request submitted</h1>
          <p className="text-sm text-gray-500 mb-4">
            Your offer to give feedback is being reviewed. Bookmark this link and check back once
            it&apos;s been approved:
          </p>
          <a href={feedbackUrl} className="text-sm text-indigo-600 hover:underline break-all">
            {feedbackUrl}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3" aria-hidden="true">
            &#128172;
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Feedback for {PROFILE.name}</h1>
          <p className="text-sm text-gray-500">
            If you&apos;d like to give feedback, let us know who you are and why. Your request will
            be reviewed before you can proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="requester-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your name or identifier
            </label>
            <input
              id="requester-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. your name, or 'Project X colleague'"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="requester-message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Brief message
            </label>
            <input
              id="requester-message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
              placeholder="e.g. 'We worked together on Project X'"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">{message.length}/100</p>
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-red-600 mb-4">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting" || !name.trim() || !message.trim()}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "submitting" ? "Submitting\u2026" : "Request to give feedback"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Already have an invite link? Use it directly.
        </p>
      </div>
    </main>
  );
}
