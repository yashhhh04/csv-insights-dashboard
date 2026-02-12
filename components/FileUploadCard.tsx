"use client";

import { useState, ChangeEvent, FormEvent } from "react";

export type AnalyzeResponse = {
  reportId: number | null;
  dbError: string | null;
  columns: string[];
  previewRows: Record<string, any>[];
  numericStats: Record<
    string,
    {
      count: number;
      min: number;
      max: number;
      mean: number;
      recentTrend: "up" | "down" | "flat" | "unknown";
    }
  >;
  summary: string;
};

export type FileUploadCardProps = {
  onAnalyzed: (data: AnalyzeResponse) => void;
};

export function FileUploadCard({ onAnalyzed }: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are supported right now.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a CSV file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      let data: Record<string, unknown>;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        setError(
          res.ok
            ? "Invalid response from server."
            : `Server error (${res.status}). Check the terminal for details. If GEMINI_API_KEY is missing, add it to .env.local and restart.`
        );
        return;
      }

      if (!res.ok) {
        setError((data?.error as string) || "Failed to analyze CSV.");
        return;
      }

      onAnalyzed(data as AnalyzeResponse);
      if (data?.dbError) {
        setError(data.dbError as string);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network or unexpected error.";
      setError(
        message.includes("fetch")
          ? "Could not reach the server. Is the dev server running?"
          : `Unexpected error while calling the analysis API. ${message}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title text-base">Step 1 · Upload CSV</h2>
          <p className="card-subtitle">
            Upload a small CSV file to preview and analyze it.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="csv-file"
          className="block cursor-pointer rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-center text-sm text-slate-300 hover:border-brand-500 hover:bg-slate-900"
        >
          <span className="font-medium">
            {file ? file.name : "Click to choose a .csv file"}
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            We only read a small preview and basic stats. Nothing is uploaded
            beyond this app.
          </span>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading || !file}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-900/40 hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isLoading ? "Analyzing…" : "Analyze CSV"}
        </button>
        {error && (
          <p className="text-xs text-amber-300" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

