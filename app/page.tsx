"use client";

import { useState } from "react";
import {
  FileUploadCard,
  type AnalyzeResponse
} from "@/components/FileUploadCard";
import { DataPreviewTable } from "@/components/DataPreviewTable";
import { InsightsPanel } from "@/components/InsightsPanel";
import { FollowupQuestionBox } from "@/components/FollowupQuestionBox";
import { ReportsSidebar } from "@/components/ReportsSidebar";

export default function HomePage() {
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row">
      <section className="flex-1 space-y-4">
        <FileUploadCard onAnalyzed={setAnalysis} />

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title text-base">Step 2 · Data preview</h2>
              <p className="card-subtitle">
                We show up to the first 20 rows so you can sanity-check the
                data.
              </p>
            </div>
          </div>
          <DataPreviewTable
            columns={analysis?.columns ?? []}
            rows={analysis?.previewRows ?? []}
          />
        </div>

        <InsightsPanel analysis={analysis} />

        <FollowupQuestionBox reportId={analysis?.reportId ?? null} />
      </section>
      <aside className="w-full lg:w-72">
        <ReportsSidebar
          onSelectReport={setAnalysis}
          refreshTrigger={analysis?.reportId ?? null}
        />
      </aside>
    </div>
  );
}

