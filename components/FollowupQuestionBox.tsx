"use client";

import { useState, FormEvent } from "react";

type FollowupQuestionBoxProps = {
  reportId: number | null;
};

export function FollowupQuestionBox({ reportId }: FollowupQuestionBoxProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) {
      setError("Ask a short, specific follow-up question.");
      return;
    }
    if (!reportId) {
      setError("You need to run an analysis before asking follow-up questions.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, question })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || "Failed to get a follow-up answer.";
        const hint = data?.details?.includes("API key")
          ? " Set GEMINI_API_KEY or GOOGLE_API_KEY in .env.local and restart the dev server."
          : "";
        setError(msg + hint);
        return;
      }
      setAnswer(data.answer);
    } catch {
      setError("Unexpected error while calling follow-up endpoint.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title text-base">Ask a follow-up question</h2>
          <p className="card-subtitle">
            Ask about trends, segments, or checks you&apos;re considering.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="E.g. Which metric changed the most recently? Any signs of seasonality?"
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-50 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Thinking…" : "Ask follow-up"}
        </button>
        {error && (
          <p className="text-xs text-amber-300" role="alert">
            {error}
          </p>
        )}
        {answer && (
          <div className="mt-2 rounded-md border border-slate-800 bg-slate-950/70 p-2 text-xs text-slate-100">
            {answer}
          </div>
        )}
      </form>
    </div>
  );
}

