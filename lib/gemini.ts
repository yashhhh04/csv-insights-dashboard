import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/** Next.js loads .env.local automatically for server; use GEMINI_API_KEY or GOOGLE_API_KEY. */
function getApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    undefined
  );
}

function getClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in .env.local (project root) and restart the dev server."
    );
  }
  return new GoogleGenAI({ apiKey });
}

/** Returns Gemini client or null if no API key is set. Use when AI is optional. */
function getClientOptional(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function ensureGeminiConfigured(): Promise<{
  ok: boolean;
  model?: string;
  error?: string;
}> {
  try {
    const ai = getClient();
    // Lightweight check: generateContent with a minimal prompt to verify credentials.
    await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Reply with exactly: ok"
    });
    return { ok: true, model: GEMINI_MODEL };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reach Gemini";
    return { ok: false, error: message };
  }
}

export type CsvAnalysisContext = {
  columns: string[];
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
  sampleRows: Record<string, string | number | null>[];
};

export async function generateInsightsFromCsv(
  context: CsvAnalysisContext
): Promise<string> {
  const { columns, numericStats, sampleRows } = context;

  const statsSummary = Object.entries(numericStats)
    .map(
      ([name, s]) =>
        `${name}: count=${s.count}, min=${s.min}, max=${s.max}, mean=${s.mean.toFixed(
          2
        )}, trend=${s.recentTrend}`
    )
    .join("\n");

  const samplePreview = sampleRows.slice(0, 5).map((row) => JSON.stringify(row));

  const prompt = `
You are a concise data analyst. You are given:
- A list of CSV columns
- Basic stats for numeric columns
- A small sample of rows

Write a short insights report (3–6 bullet points) for a non-technical stakeholder:
- Call out overall patterns or trends
- Mention any obvious outliers or unusual ranges
- Suggest 2–3 concrete follow-up checks or questions
- Keep it under 220 words.

Columns:
${columns.join(", ")}

Numeric column stats:
${statsSummary || "No numeric columns detected."}

Sample rows:
${samplePreview.join("\n")}
`.trim();

  const ai = getClientOptional();
  if (!ai) {
    return (
      "AI insights are currently unavailable. Set GEMINI_API_KEY or GOOGLE_API_KEY in .env.local (project root) and restart the dev server (npm run dev). Basic stats are still shown above."
    );
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          "You are a senior data analyst. Be clear, honest, and avoid buzzwords.",
        temperature: 0.3
      }
    });

    const text = response.text ?? "";
    return text.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    let userMessage = "AI insights are currently unavailable. Basic stats are still shown above.";
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      userMessage += "\n\nQuota exceeded for Google Gemini API. Please check your billing details or try again later.";
    } else {
      userMessage += "\n\n" + message;
    }
    return userMessage;
  }
}

export async function answerFollowUp(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.35
      }
    });
    const text = response.text ?? "";
    return text.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      return "Unable to answer follow-up question due to API quota exceeded. Please check your Google Gemini API billing or try again later.";
    } else {
      return "Unable to generate follow-up answer due to an API error. Please try again.";
    }
  }
}

export { GEMINI_MODEL };
