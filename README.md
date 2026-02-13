CSV Insights Dashboard

Upload a CSV, preview the data, get AI-powered summaries, ask follow-up questions, and view recent reports using a Next.js app.

--------------------------------------------------

Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL (Supabase) with Prisma
- GitHub Models API (gpt-4o-mini)

--------------------------------------------------

Features

- Upload and preview CSV files
- Automatic numeric statistics (count, min, max, mean, trend)
- AI-generated summaries
- Follow-up questions using AI
- Report history (last 5 reports)
- Simple charts
- Status / health page

--------------------------------------------------

Local Setup

1. Install dependencies

npm install


2. Create .env.local file

GITHUB_MODELS_API_KEY=your_github_token
DATABASE_URL=your_postgres_url


3. Setup database

npx prisma migrate dev --name init
npx prisma generate


4. Run development server

npm run dev

Open: http://localhost:3000
Status: http://localhost:3000/status

--------------------------------------------------

Deployment (Vercel)

Add these environment variables in Vercel:

GITHUB_MODELS_API_KEY
DATABASE_URL

Build command:

prisma generate && next build

--------------------------------------------------

How It Works

- CSV files are uploaded to /api/analyze
- Server parses data and computes stats
- GitHub Models API generates insights
- Reports are saved using Prisma
- Follow-up questions use stored context

--------------------------------------------------

Error Handling

- Invalid or empty files are rejected
- Database failures show warnings
- AI failures fall back to messages

--------------------------------------------------

Notes

- No authentication system
- No multi-user separation
- Designed as a learning and portfolio project

--------------------------------------------------