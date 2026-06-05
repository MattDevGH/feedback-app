"use client";

import { useState, useEffect, useCallback } from "react";
import { isFormComplete } from "@/lib/questions.config";

type Status = "idle" | "submitting" | "success" | "error";

function getDraftKey(token: string) {
  return `feedback-draft-${token}`;
}

function loadDraft(token: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(getDraftKey(token));
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveDraft(token: string, answers: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getDraftKey(token), JSON.stringify(answers));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

function clearDraft(token: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getDraftKey(token));
}

export function useFeedbackForm(token: string) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraft(token);
    if (Object.keys(draft).length > 0) {
      setAnswers(draft);
    }
  }, [token]);

  const updateAnswer = useCallback(
    (questionKey: string, value: string) => {
      setAnswers((prev) => {
        const updated = { ...prev, [questionKey]: value };
        saveDraft(token, updated);
        return updated;
      });
    },
    [token],
  );

  async function submit() {
    setStatus("submitting");
    setErrorMessage("");

    const responses = Object.entries(answers)
      .filter(([, value]) => value.trim() !== "")
      .map(([questionKey, value]) => ({ questionKey, value }));

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, responses }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed. Please try again.");
      }

      clearDraft(token);
      setStatus("success");
      setAnswers({});
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return {
    answers,
    status,
    errorMessage,
    isReady: isFormComplete(answers),
    updateAnswer,
    submit,
  };
}
