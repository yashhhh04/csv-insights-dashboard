import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseJsonOrNull(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const idParam = searchParams.get("id");

  try {
    if (idParam) {
      const id = Number(idParam);
      if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid report id." }, { status: 400 });
      }

      const report = await prisma.report.findUnique({
        where: { id }
      });

      if (!report) {
        return NextResponse.json({ error: "Report not found." }, { status: 404 });
      }

      const previewRowsParsed = parseJsonOrNull(report.samplePreview);
      const numericStatsParsed = parseJsonOrNull(report.stats);
      if (!Array.isArray(previewRowsParsed) || !numericStatsParsed) {
        return NextResponse.json(
          {
            error:
              "This report is corrupted in storage and cannot be opened safely."
          },
          { status: 500 }
        );
      }

      const previewRows = previewRowsParsed as Record<string, unknown>[];
      const numericStats = numericStatsParsed as Record<string, unknown>;
      return NextResponse.json({
        report: {
          reportId: report.id,
          dbError: null,
          columns: Object.keys(previewRows[0] ?? {}),
          previewRows,
          numericStats,
          summary: report.summary
        }
      });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        llmModel: true
      }
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to read reports from the database.",
        details: error?.message
      },
      { status: 500 }
    );
  }
}
