const GITHUB_MODEL = "gpt-4o-mini";

/** Get GitHub Models API key from environment */
function getApiKey(): string | undefined {
  return process.env.GITHUB_MODELS_API_KEY?.trim() || undefined;
}

/** Make API call to GitHub Models */
async function callGitHubModelsAPI(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing API key. Set GITHUB_MODELS_API_KEY in .env.local (project root) and restart the dev server."
    );
  }

  const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GITHUB_MODEL,
      messages: [
        {
          role: "system",
          content: systemInstruction
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.3,
      top_p: 1,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `API request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function ensureGitHubModelsConfigured(): Promise<{
  ok: boolean;
  model?: string;
  error?: string;
}> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        ok: false,
        error: "Missing GITHUB_MODELS_API_KEY. Set it in .env.local and restart."
      };
    }

    await callGitHubModelsAPI("You are a helpful assistant.", "Reply with exactly: ok");
    return { ok: true, model: GITHUB_MODEL };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reach GitHub Models API";
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
  const { columns, sampleRows } = context;

  // Take only first 5 rows as sample
  const csvDataSample = sampleRows.slice(0, 5);

  const prompt = `
I have a CSV file with the following columns: ${columns.join(", ")}.
Here is a sample of the first 5 rows: ${JSON.stringify(csvDataSample)}.

Please provide:
1. A 2-sentence summary of what this data represents.
2. Three key trends or potential outliers.
3. One "next step" for analysis.
Format your response in Markdown.
`.trim();

  const apiKey = getApiKey();
  if (!apiKey) {
    return (
      "AI insights are currently unavailable. Set GITHUB_MODELS_API_KEY in .env.local (project root) and restart the dev server (npm run dev). Basic stats are still shown above."
    );
  }

  try {
    const response = await callGitHubModelsAPI(
      "You are a concise data analyst. Be clear, honest, and avoid buzzwords.",
      prompt
    );
    return response.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    let userMessage = "AI insights are currently unavailable. Basic stats are still shown above.";
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      userMessage += "\n\nQuota exceeded for GitHub Models API. Please check your billing details or try again later.";
    } else if (message.includes("401") || message.includes("Unauthorized")) {
      userMessage += "\n\nInvalid API key. Please check your GITHUB_MODELS_API_KEY in .env.local.";
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
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing API key. Set GITHUB_MODELS_API_KEY in .env.local (project root) and restart the dev server."
    );
  }

  try {
    const response = await callGitHubModelsAPI(systemInstruction, userPrompt);
    return response.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      return "Unable to answer follow-up question due to API quota exceeded. Please check your GitHub Models API billing or try again later.";
    } else if (message.includes("401") || message.includes("Unauthorized")) {
      return "Invalid API key. Please check your GITHUB_MODELS_API_KEY in .env.local.";
    } else {
      return "Unable to generate follow-up answer due to an API error. Please try again.";
    }
  }
}

export { GITHUB_MODEL };
