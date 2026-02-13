# AI_NOTES

Short notes on how AI was used to build this app, and what was manually reviewed.

---

## What AI was used for

### Project scaffolding

- Suggested a **Next.js 14 + TypeScript + Tailwind + Prisma + PostgreSQL** architecture.
- Drafted the initial:
  - `package.json`
  - `tsconfig.json`
  - Tailwind configuration
  - App Router layout structure
- Helped configure Prisma for local and production environments.

---

### Backend implementation

- Drafted the core API routes:
  - `POST /api/analyze` for:
    - CSV upload
    - Parsing
    - Numeric statistics
    - LLM-based insights
  - `GET /api/reports` and `GET /api/reports?id=...` for report history.
  - `POST /api/followup` for follow-up questions.
  - `GET /api/status` for backend health checks.
- Proposed CSV parsing and numeric-stat computation logic.
- Wrote the initial LLM helper (`lib/github-models.ts`) for:
  - Insight generation
  - Follow-up answers
  - Status checks.
- Assisted in Prisma schema design and migrations.

---

### Frontend implementation

- Drafted React components for:
  - `FileUploadCard`
  - `DataPreviewTable`
  - `InsightsPanel`
  - `NumericColumnChart`
  - `FollowupQuestionBox`
  - `ReportsSidebar`
  - `StatusCard`
- Structured the home page and status page layouts.
- Wired UI components to backend API routes.

---

### Deployment & Infrastructure

- Assisted with:
  - Supabase PostgreSQL setup
  - Vercel environment configuration
  - Prisma deployment fixes
  - Build pipeline configuration (`prisma generate && next build`)
- Helped resolve production issues related to:
  - Environment variables
  - Prisma caching
  - API deployment errors.

---

### Documentation

- Drafted the first versions of:
  - `README.md`
  - `AI_NOTES.md`
- Helped update documentation after infrastructure changes.

---

## What was manually checked / adjusted

### Error paths and edge cases

- Ensured upload errors are surfaced clearly:
  - Empty files
  - Non-CSV uploads
  - Malformed CSV
  - Header-only files
- Ensured DB and LLM failures degrade gracefully.
- Verified meaningful user-facing error messages.

---

### Types and data shapes

- Verified API payloads match frontend expectations.
- Confirmed report history queries return:
  - Lightweight fields for lists
  - Full data for detailed views.
- Ensured Prisma `Report` model matches:
  - `samplePreview`
  - `stats`
  - `summary`
  - `llmModel`.

---

### Status checks

- LLM status uses a lightweight inference test call.
- Database health uses simple read queries.
- API health checks avoid expensive operations.

---

### Security & privacy basics

- No API keys are logged.
- Secrets are stored only in environment variables.
- `.env.local` is excluded from version control.
- No sensitive user data is persisted beyond uploaded CSV content.
- Database access is restricted via Supabase credentials.

---

## LLM provider and model choice

- **Provider**: GitHub Models API
- **Default model**: `gpt-4o-mini`

### Why this choice

- **Quality**: Produces concise, structured summaries for tabular data.
- **Latency**: Fast enough for real-time CSV analysis.
- **Cost & Access**: Uses GitHub Personal Access Tokens.
- **Stability**: Well-integrated with Azure inference backend.

You can switch models by editing `GITHUB_MODEL` in `lib/github-models.ts`.

---

## Database & storage

- **Database**: Supabase PostgreSQL
- **ORM**: Prisma

### Why this choice

- Managed Postgres with good Vercel compatibility.
- Prisma provides type-safe queries and migrations.
- Supports production scaling and backups.

---

## How to adapt / extend

If continuing with AI-assisted development:

### Prefer using AI for

- Boilerplate generation (routes, components, utilities).
- Documentation drafts.
- Refactoring suggestions.
- Prompt experimentation.
- UI layout ideas.

---

### Manually review

- All authentication and authorization logic.
- API keys and secrets handling.
- Database migrations.
- Data retention and deletion policies.
- Any user-facing prompts.
- File upload and storage handling.

---

## Current limitations

- No user authentication (all reports are globally visible).
- No per-user data isolation.
- No background job processing.
- LLM requests depend on GitHub API availability.

These may be addressed in future versions.

---

## Summary

This project uses AI primarily as a productivity tool for:

- Initial scaffolding
- API design
- Documentation
- LLM integration

All critical logic, deployment setup, security decisions, and production behavior were manually reviewed and adjusted.

AI-assisted development accelerated iteration speed, while human oversight ensured reliability and correctness.
