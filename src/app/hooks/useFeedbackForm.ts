"use client";

import { useState } from "react";
import { isFormComplete } from "@/lib/questions.config";

type Status = "idle" | "submitting" | "success" | "error";

export function useFeedbackForm() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function updateAnswer(questionKey: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  }

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

  return {
    answers,
    status,
    errorMessage,
    isReady: isFormComplete(answers),
    updateAnswer,
    submit,
  };
}
