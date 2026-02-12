import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { answerFollowUp } from "@/lib/github-models";

function parseJsonOrNull(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reportId = Number(body?.reportId);
    const question = String(body?.question ?? "").trim();

    if (!reportId || Number.isNaN(reportId)) {
      return NextResponse.json(
        { error: "A valid reportId is required." },
        { status: 400 }
      );
    }
    if (!question) {
      return NextResponse.json(
        { error: "A non-empty question is required." },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found. Run a new analysis first." },
        { status: 404 }
      );
    }

    const samplePreviewParsed = parseJsonOrNull(report.samplePreview);
    const statsParsed = parseJsonOrNull(report.stats);
    if (!Array.isArray(samplePreviewParsed) || !statsParsed) {
      return NextResponse.json(
        {
          error: "Saved report data is invalid. Re-run the CSV analysis first."
        },
        { status: 500 }
      );
    }
    const samplePreview = samplePreviewParsed as Record<string, unknown>[];
    const stats = statsParsed as Record<string, unknown>;

    const systemInstruction =
      "You are a pragmatic data analyst. Be honest about uncertainty and avoid over-claiming.";

    const userPrompt = `
You are helping a user explore a CSV they've already analyzed.
You are given:
- The original short insights summary
- A small preview of the rows
- Aggregated stats for numeric columns

Answer the user's follow-up question briefly (under 180 words).
If you cannot be confident, say so explicitly and suggest what extra data or slice would help.

Original summary:
${report.summary}

Numeric column stats (JSON):
${JSON.stringify(stats, null, 2)}

Sample rows (truncated):
${JSON.stringify(samplePreview.slice(0, 10), null, 2)}

User question:
${question}
`.trim();

    try {
      const answer = await answerFollowUp(systemInstruction, userPrompt);
      return NextResponse.json({ answer });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        {
          error:
            "LLM follow-up is currently unavailable. Try again later or refine your question.",
          details: message
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Unexpected error while handling follow-up question.",
        details: message
      },
      { status: 500 }
    );
  }
}
