import { AnalyzeResponse } from "./FileUploadCard";
import { NumericColumnChart } from "./NumericColumnChart";
import { useState } from "react";

type InsightsPanelProps = {
  analysis: AnalyzeResponse | null;
};

export function InsightsPanel({ analysis }: InsightsPanelProps) {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title text-base">Step 3 · Insights</h2>
        </div>
        <p className="card-subtitle">
          Once you analyze a CSV, you&apos;ll see numeric stats, charts, and an AI summary here.
        </p>
      </div>
    );
  }

  const { columns, previewRows, numericStats, summary, reportId } = analysis;
  const numericColumns = Object.keys(numericStats);
  const activeColumn =
    selectedColumn && numericColumns.includes(selectedColumn)
      ? selectedColumn
      : numericColumns[0] ?? null;

  async function handleCopy() {
    const text = [
      "CSV Insights Report",
      "",
      summary,
      "",
      "Key numeric columns:",
      ...numericColumns.map((name) => {
        const s = numericStats[name];
        return `${name}: min=${s.min}, max=${s.max}, mean=${s.mean.toFixed(
          2
        )}, count=${s.count}, trend=${s.recentTrend}`;
      })
    ].join("\n");
    await navigator.clipboard.writeText(text);
  }

  function handleDownload() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `csv-insights-report-${reportId ?? "unsaved"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title text-base">Step 3 · Insights</h2>
            <p className="card-subtitle">
              A short AI-generated summary plus simple per-column stats.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
            >
              Copy report
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-md bg-brand-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm shadow-brand-900/40 hover:bg-brand-600"
            >
              Download JSON
            </button>
          </div>
        </div>
        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-50">
          {summary}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr,1.5fr]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Column stats
            </p>
            <ul className="space-y-1 text-xs text-slate-200">
              {numericColumns.length === 0 && (
                <li className="text-slate-500">
                  No numeric columns were detected in this dataset.
                </li>
              )}
              {numericColumns.map((name) => {
                const s = numericStats[name];
                return (
                  <li
                    key={name}
                    className="flex items-start justify-between gap-2 rounded border border-slate-800/80 bg-slate-950/70 px-2 py-1.5"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-100">
                        {name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        min {s.min} · max {s.max} · mean{" "}
                        {s.mean.toFixed(2)} · n={s.count}
                      </span>
                    </div>
                    <span className="badge badge-ok capitalize">
                      {s.recentTrend === "unknown" ? "n/a" : s.recentTrend}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Simple chart
              </p>
              <select
                value={activeColumn ?? ""}
                onChange={(e) =>
                  setSelectedColumn(e.target.value || null)
                }
                className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
              >
                <option value="">Select numeric column</option>
                {numericColumns.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            {activeColumn ? (
              <NumericColumnChart
                column={activeColumn}
                rows={previewRows}
              />
            ) : (
              <p className="text-xs text-slate-500">
                Choose a numeric column to see a quick line chart of its
                values.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

