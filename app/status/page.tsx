"use client";

import { useState } from "react";
import { StatusCard } from "@/components/StatusCard";

type StatusResponse = {
  backend: { ok: boolean; message: string };
  database: { ok: boolean; message: string };
  llm: { ok: boolean; message: string; model?: string };
  checkedAt: string;
};

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function runCheck() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Health check failed.");
        return;
      }
      setStatus(data as StatusResponse);
    } catch {
      setError("Could not reach the status endpoint.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title text-base">System status</h1>
            <p className="card-subtitle">
              Check the health of the frontend, backend API, database, and LLM
              connection.
            </p>
          </div>
          <button
            type="button"
            onClick={runCheck}
            disabled={isLoading}
            className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-900/40 hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {isLoading ? "Checking…" : "Run health check"}
          </button>
        </div>
        {error && (
          <p className="mt-1 text-xs text-amber-300" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p className="mt-2 text-xs text-slate-500">
            Last checked:{" "}
            <span className="font-mono">
              {new Date(status.checkedAt).toLocaleString()}
            </span>
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard label="Backend API" status={status?.backend ?? null} />
        <StatusCard label="Database" status={status?.database ?? null} />
        <StatusCard label="LLM (GitHub Models)" status={status?.llm ?? null} />
      </div>
    </div>
  );
}

