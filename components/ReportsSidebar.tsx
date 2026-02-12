import { useEffect, useState } from "react";
import type { AnalyzeResponse } from "./FileUploadCard";

type ReportListItem = {
  id: number;
  title: string;
  createdAt: string;
  llmModel: string;
};

type ReportsSidebarProps = {
  onSelectReport: (report: AnalyzeResponse) => void;
  /** When this changes (e.g. new reportId after analysis), sidebar refetches the list. */
  refreshTrigger?: number | null;
};

export function ReportsSidebar({ onSelectReport, refreshTrigger }: ReportsSidebarProps) {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "Failed to load reports.");
          return;
        }
        setError(null);
        setReports(data.reports ?? []);
      } catch {
        setError("Could not load saved reports.");
      }
    }
    loadReports();
  }, [refreshTrigger]);

  async function handleClick(id: number) {
    try {
      const res = await fetch(`/api/reports?id=${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to open report.");
        return;
      }
      onSelectReport(data.report as AnalyzeResponse);
    } catch {
      setError("Could not open this report.");
    }
  }

  return (
    <div className="card h-full">
      <div className="card-header">
        <h2 className="card-title">Recent reports</h2>
      </div>
      {error && (
        <p className="mb-2 text-xs text-amber-300" role="alert">
          {error}
        </p>
      )}
      {reports.length === 0 ? (
        <p className="card-subtitle">
          The last five reports you save will be listed here for quick access.
        </p>
      ) : (
        <ul className="mt-1 space-y-1 text-xs">
          {reports.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => handleClick(r.id)}
                className="flex w-full flex-col rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1.5 text-left hover:border-brand-500"
              >
                <span className="truncate font-medium text-slate-100">
                  {r.title}
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(r.createdAt).toLocaleString()} · {r.llmModel}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

