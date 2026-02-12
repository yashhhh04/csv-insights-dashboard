import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { prisma } from "@/lib/prisma";
import {
  CsvAnalysisContext,
  generateInsightsFromCsv,
  GITHUB_MODEL
} from "@/lib/github-models";

type ParsedRow = Record<string, string>;
const MAX_CSV_BYTES = 5 * 1024 * 1024; // 5 MB

function computeNumericStats(rows: ParsedRow[], columns: string[]) {
  const numericStats: CsvAnalysisContext["numericStats"] = {};

  for (const col of columns) {
    const values: number[] = [];
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let sum = 0;
    for (const row of rows) {
      const raw = row[col];
      if (raw == null || raw === "") continue;
      const num = Number(raw);
      if (!Number.isNaN(num) && Number.isFinite(num)) {
        values.push(num);
        if (num < min) min = num;
        if (num > max) max = num;
        sum += num;
      }
    }

    if (values.length === 0) continue;

    const count = values.length;
    const mean = sum / count;

    let recentTrend: "up" | "down" | "flat" | "unknown" = "unknown";
    if (values.length >= 3) {
      const recent = values.slice(-5);
      const first = recent[0]!;
      const last = recent[recent.length - 1]!;
      const delta = last - first;
      const threshold = Math.max(Math.abs(first) * 0.02, 1e-9); // 2% change considered material
      if (Math.abs(delta) < threshold) {
        recentTrend = "flat";
      } else {
        recentTrend = delta > 0 ? "up" : "down";
      }
    }

    numericStats[col] = {
      count,
      min,
      max,
      mean,
      recentTrend
    };
  }

  return numericStats;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a CSV file." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only .csv files are supported right now." },
        { status: 400 }
      );
    }
    if (typeof file.size === "number" && file.size > MAX_CSV_BYTES) {
      return NextResponse.json(
        {
          error: `CSV file is too large. Max supported size is ${Math.round(
            MAX_CSV_BYTES / (1024 * 1024)
          )}MB.`
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const text = Buffer.from(arrayBuffer).toString("utf8");

    if (!text.trim()) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    let records: ParsedRow[];
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as ParsedRow[];
    } catch (error: any) {
      return NextResponse.json(
        {
          error:
            "Could not parse this CSV. Please check the format and try again.",
          details: error?.message
        },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        {
          error:
            "The CSV appears to have a header but no data rows. Add some rows and retry."
        },
        { status: 400 }
      );
    }

    const columns = Object.keys(records[0] ?? {});
    if (columns.length === 0) {
      return NextResponse.json(
        {
          error:
            "No columns were detected. Please ensure the first row contains headers."
        },
        { status: 400 }
      );
    }

    const previewRows = records.slice(0, 20);
    const numericStats = computeNumericStats(records, columns);

    const context: CsvAnalysisContext = {
      columns,
      numericStats,
      sampleRows: previewRows
    };

    const summary = await generateInsightsFromCsv(context);

    // Persist report; if DB is unavailable, fall back gracefully.
    let reportId: number | null = null;
    let dbError: string | null = null;
    try {
      const report = await prisma.report.create({
        data: {
          title: `${file.name || "Untitled CSV"} – ${new Date().toISOString()}`,
          summary,
          samplePreview: JSON.stringify(previewRows),
          stats: JSON.stringify(numericStats),
          llmModel: GITHUB_MODEL
        }
      });
      reportId = report.id;
    } catch (error: any) {
      dbError =
        "Could not save this report. You can still copy or download it from the UI.";
    }

    return NextResponse.json({
      reportId,
      dbError,
      columns,
      previewRows,
      numericStats,
      summary
    });
  } catch (error: any) {
    console.error("Analyze API error", error);
    return NextResponse.json(
      {
        error: "Unexpected error while analyzing CSV.",
        details: error?.message
      },
      { status: 500 }
    );
  }
}
