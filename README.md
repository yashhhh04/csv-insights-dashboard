# CSV Insights Dashboard

Upload a CSV, preview the data, get a short AI-powered summary of trends/outliers, ask follow-up questions, and keep the last 5 reports — all in a small Next.js app.

## Tech stack

- **Frontend / backend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma
- **LLM provider**: GitHub Models API (e.g. `gpt-4o-mini`)

## Features

- **CSV upload & preview**
  - Upload a `.csv` file from the home page.
  - Server-side parsing and basic validation (empty file, wrong extension, malformed CSV).
  - Table preview of up to the first 20 rows.
- **Automatic numeric stats**
  - Detects numeric columns.
  - Computes `count`, `min`, `max`, `mean`, and a simple recent trend (up/down/flat).
- **AI insights summary**
  - Sends compact stats + a small row sample to Google Gemini.
  - Returns a short, business-friendly bullet summary.
- **Simple charts & column selection**
  - Choose a numeric column and view a small line chart of its values.
- **Follow-up question box**
  - Ask a natural-language follow-up question about the selected CSV/report.
- **Report history**
  - Last 5 reports are stored in SQLite and shown on the home page sidebar.
  - Clicking a report reloads its preview, numeric stats, and AI summary.
- **Report export**
  - **Copy**: Copy a textual summary + key stats to the clipboard.
  - **Download**: Download a JSON file containing the report payload.
- **Status page**
  - `/status` page with cards for:
    - Backend API reachability
    - Database connection health
    - Gemini API connectivity & model name

## Getting started

### 1. Prerequisites

- Node.js 18+ (recommended by Next.js)
- npm (or another compatible package manager)

### 2. Install dependencies

From the project root:

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the project root:

```bash
# Get a GitHub Personal Access Token from https://github.com/settings/tokens
# Then use it with GitHub Models API
GITHUB_MODELS_API_KEY=your_github_pat_token_here
```

**Important:** After adding or changing the API key, restart the dev server (`Ctrl+C` then `npm run dev`). Next.js only reads `.env.local` at startup.

If no API key is set, the app will still:

- Parse CSVs
- Compute and show basic stats
- Show error messages where AI-generated text would have appeared

### 4. Set up the database

This app uses a local SQLite database file (`prisma/dev.db`) managed by Prisma.

```bash
npx prisma migrate dev --name init
```

This will:

- Create `prisma/dev.db`
- Generate the Prisma client from `prisma/schema.prisma`

You can regenerate the client later with:

```bash
npx prisma generate
```

### 5. Run the dev server

```bash
npm run dev
```

Visit:

- Home: `http://localhost:3000/`
- Status: `http://localhost:3000/status`

## How it works

### Home page flow

1. **Upload CSV**
   - `FileUploadCard` posts a `FormData` payload to `POST /api/analyze`.
2. **Server-side analysis**
   - `app/api/analyze/route.ts`:
     - Parses CSV with `csv-parse/sync`.
     - Extracts column headers and first 20 rows.
     - Computes numeric stats and a simple up/down/flat trend.
     - Calls GitHub Models API via `lib/github-models.ts` to generate a compact summary (using only first 5 rows).
     - Attempts to persist a `Report` record in SQLite via Prisma.
3. **Preview & insights**
   - `DataPreviewTable` shows the table preview.
   - `InsightsPanel` displays:
     - The AI summary
     - Per-column numeric stats
     - A chart area (via `recharts`) for a selected numeric column.
4. **Follow-up**
   - `FollowupQuestionBox` posts to `POST /api/followup` with `reportId` + question.
   - Backend reuses stored summary, stats, and sample rows to answer.
5. **History & export**
   - `ReportsSidebar` calls `GET /api/reports` to show the last 5 reports.
   - Clicking one issues `GET /api/reports?id=...` to reload it into the main view.
   - `InsightsPanel` provides **Copy report** and **Download JSON** buttons.

### Status page

- `GET /api/status` runs three checks:
  - **Backend**: Confirms the route itself is reachable.
  - **Database**: Executes a trivial Prisma query (`report.count()`).
  - **LLM**: Uses `ensureGitHubModelsConfigured()` which:
    - Checks `GITHUB_MODELS_API_KEY`
    - Calls GitHub Models API with a minimal prompt as a credential/availability check.
- `app/status/page.tsx`:
  - Has a **Run health check** button that fetches `/api/status`.
  - Renders three `StatusCard` components with color-coded badges.

## Basic error handling

- **Empty / missing file**: Returns a `400` with a friendly message.
- **Wrong extension**: Rejects non-`.csv` uploads with guidance.
- **Malformed CSV**: Catches parser errors and surfaces them in the UI.
- **No rows or no header**: Explains what is missing and how to fix it.
- **DB failures**:
  - Analysis still runs in memory.
  - Response includes a `dbError` message; the UI surfaces this without blocking insights.
- **LLM failures / missing API key**:
  - Status page shows the failure.
  - Analysis endpoint falls back to a simple explanatory message instead of a summary.
  - Follow-up endpoint returns an error JSON when it can't talk to GitHub Models API.

## What is not done (intentionally)

- No authentication or user accounts.
- No authorization or multi-tenant separation.
- No file size limits or streaming for very large CSVs.
- No dedicated logging/observability or metrics dashboards.
- No automated tests; only basic manual testing is described.
- No CSV download of transformed data (only report JSON/text export).

## Manual testing checklist

- Upload a small numeric CSV and confirm:
  - Preview table looks correct.
  - Numeric stats match expectations.
  - Summary feels reasonable for the data.
- Try edge cases:
  - Empty file.
  - Header-only file.
  - Mixed text and numeric columns.
  - Badly formatted rows.
- Break things intentionally:
  - Remove `GITHUB_MODELS_API_KEY` and hit `/status` + analyze a CSV.
  - Temporarily change the Prisma datasource URL to an invalid path and restart dev:
    - Confirm DB shows as unhealthy on `/status`.
    - Confirm CSV analysis still works but warns that saving the report failed.

