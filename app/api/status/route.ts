import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureGitHubModelsConfigured } from "@/lib/github-models";

export async function GET() {
  const backend = {
    ok: true,
    message: "API route is reachable."
  };

  let dbStatus: { ok: boolean; message: string } = {
    ok: false,
    message: "Not checked"
  };

  let llmHealthStatus: { ok: boolean; message: string; model?: string } = {
    ok: false,
    message: "Not checked"
  };

  // Database health
  try {
    await prisma.report.count();
    dbStatus = { ok: true, message: "Connected to SQLite via Prisma." };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to query database.";
    dbStatus = { ok: false, message };
  }

  // LLM health (GitHub Models)
  const llmResult = await ensureGitHubModelsConfigured();
  llmHealthStatus = llmResult.ok
    ? {
        ok: true,
        message: "GitHub Models API reachable and credentials appear valid.",
        model: llmResult.model
      }
    : {
        ok: false,
        message: llmResult.error ?? "Failed to talk to GitHub Models API."
      };

  return NextResponse.json({
    backend,
    database: dbStatus,
    llm: llmHealthStatus,
    checkedAt: new Date().toISOString()
  });
}

