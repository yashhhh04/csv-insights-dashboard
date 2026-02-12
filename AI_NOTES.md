# AI_NOTES

Short notes on how AI was used to build this app, and what was manually reviewed.

## What AI was used for

- **Project scaffolding**
  - Suggested a Next.js 14 + TypeScript + Tailwind + Prisma + OpenAI architecture.
  - Drafted the initial `package.json`, `tsconfig.json`, Tailwind config, and Next layout structure.
- **Backend implementation**
  - Drafted the core API routes:
    - `POST /api/analyze` for CSV upload, parsing, numeric stats, and OpenAI summary.
    - `GET /api/reports` and `GET /api/reports?id=...` for listing/opening reports.
    - `POST /api/followup` for follow-up questions grounded in the stored report.
    - `GET /api/status` for backend/DB/LLM health checks.
  - Proposed CSV parsing and numeric-stat computation logic.
  - Wrote the initial OpenAI helper (`lib/openai.ts`) for insight generation and status checks.
- **Frontend implementation**
  - Drafted React components for:
    - `FileUploadCard`
    - `DataPreviewTable`
    - `InsightsPanel`
    - `NumericColumnChart`
    - `FollowupQuestionBox`
    - `ReportsSidebar`
    - `StatusCard`
  - Structured the home page and status page layouts and wiring to API routes.
- **Docs**
  - Drafted the first versions of `README.md` and this `AI_NOTES.md`.

## What was manually checked / adjusted

- **Error paths and edge cases**
  - Ensured upload errors are surfaced clearly (empty file, non-CSV, malformed CSV, header-only).
  - Ensured DB and LLM failures degrade gracefully (analysis still runs, user sees a clear message).
- **Types and data shapes**
  - Verified that the payload returned from `POST /api/analyze` matches what the frontend expects.
  - Confirmed report history queries only return lightweight fields for the list and full data for a single report.
  - Ensured the `Report` Prisma model matches how the app reads `samplePreview`, `stats`, and `summary`.
- **Status checks**
  - LLM status uses a lightweight `models.list()` call, not a heavy generation.
  - Database health uses a simple `.count()` query.
- **Security & privacy basics**
  - No sensitive keys are ever logged.
  - Reports are stored in a local SQLite file; no multi-tenant assumptions.

## LLM provider and model choice

- **Provider**: GitHub Models API
- **Default model**: `gpt-4o-mini`

**Why this choice:**

- Good balance between:
  - **Quality**: Handles small, structured CSV-context prompts with clear, concise summaries.
  - **Latency**: Reasonably fast responses for short summaries and follow-ups.
  - **Ecosystem**: Well-documented API and stable access via GitHub PAT tokens.

You can switch models by setting a different model in `lib/github-models.ts`.

## How to adapt / extend

If you continue with AI-assisted development:

- Prefer using AI for:
  - Boilerplate wiring (new API routes, UI components, simple charts).
  - Refactoring and documentation drafts.
  - Exploring alternative data summaries or prompt styles.
- Manually review:
  - All changes that touch security (auth, secrets, file system access).
  - Schema migrations, data retention behavior, and any PII handling.
  - Any prompts that are used in production for user-facing text.

