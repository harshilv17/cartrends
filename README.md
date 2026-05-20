# AI Attendance & Timesheet Analyzer

A clean, modern web app that analyzes employee attendance and timesheet data
and produces simple, rule-based productivity insights — no machine-learning
models, just plain statistics and easy-to-read logic.

---

## Features

- **Authentication** — simple login with Admin / Employee demo accounts
- **Employee management** — add, edit, delete employees and assign departments
- **Attendance** — CSV bulk upload + manual entry, auto status detection
- **Timesheets** — log daily work hours against projects and tasks
- **AI insights** — rule-based analysis: punctuality, burnout risk, overtime,
  most productive department, low attendance alerts
- **Dashboard** — KPI cards, pie / bar / line charts, weekly trend, stats table
- **Reports** — export attendance and productivity data as CSV

---

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Next.js (App Router), TypeScript    |
| Styling  | TailwindCSS + shadcn/ui components  |
| Backend  | Next.js API routes                  |
| Database | PostgreSQL (Neon) + Prisma ORM      |
| Charts   | Recharts                            |
| AI logic | Groq LLM (Llama 3.3) + rule-based fallback |

---

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma        # Users, Employees, Attendance, Timesheets, Departments
│   └── seed.ts              # Realistic dummy data
├── public/
│   └── sample-attendance.csv  # Example CSV for the upload feature
├── src/
│   ├── app/
│   │   ├── login/           # Login page
│   │   ├── (dashboard)/     # App shell + protected pages
│   │   │   ├── dashboard/   # KPIs, charts, insights
│   │   │   ├── employees/   # Employee CRUD
│   │   │   ├── attendance/  # CSV upload + manual entry
│   │   │   ├── timesheets/  # Work hour logging
│   │   │   ├── insights/    # AI insights + analysis tables
│   │   │   └── reports/     # CSV exports
│   │   └── api/             # Backend API routes
│   ├── components/          # UI components, charts, cards
│   └── lib/
│       ├── prisma.ts        # Prisma client
│       ├── analytics.ts     # Insight + statistics engine
│       └── utils.ts         # Shared helpers
```

---

## Setup

> Requires Node.js 18+ and a free [Neon](https://neon.tech) Postgres project.

```bash
# 1. Install dependencies
npm install

# 2. Configure database connection
cp .env.example .env
# Then paste your Neon "Pooled" and "Direct" connection strings into .env
# (DATABASE_URL and DIRECT_URL respectively).

# 3. Push the schema to your Neon database
npm run db:push

# 4. Seed realistic dummy data
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000> and log in.

### Deploying

1. Push the repo to GitHub.
2. Import the project on Vercel (or any Node host).
3. Add `DATABASE_URL` and `DIRECT_URL` from Neon as environment variables.
4. Run `npm run db:push && npm run db:seed` once against the Neon database
   (locally or via a one-off Vercel build step) to set up tables and data.

### Demo Accounts

| Role     | Email               | Password |
| -------- | ------------------- | -------- |
| Admin    | admin@company.com   | admin123 |
| Employee | rahul@company.com   | emp123   |

---

## Useful Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server             |
| `npm run build`   | Production build                         |
| `npm run db:push` | Apply the Prisma schema to the database  |
| `npm run db:seed` | Fill the database with sample data       |
| `npm run db:reset`| Wipe and re-seed the database            |

---

## How the AI Insights Work

Insights run through a **two-stage pipeline**:

1. **Statistical layer** (`src/lib/analytics.ts`) — pure functions compute
   per-employee stats from raw attendance records: average hours, late
   days, overtime days, attendance %, punctuality %. These are also
   aggregated to the department level.

2. **LLM layer** (`src/lib/groq.ts`) — the computed stats are sent to a
   Groq-hosted Llama 3.3 model with a structured JSON prompt. The model
   writes 4–6 short, manager-friendly insights referencing real names
   and numbers from the data (no hallucinated values).

If `GROQ_API_KEY` is missing or the API call fails, the app automatically
falls back to the deterministic rule-based engine — so the dashboard
never breaks.

Example LLM output:

> *"Rahul Sharma worked 18% more hours than the team average and may be at burnout risk."*

---

## CSV Upload Format

The attendance upload expects this header row:

```
employeeName,date,checkIn,checkOut,totalHours,status
```

A ready-to-use example lives at `public/sample-attendance.csv`.

---

## Notes

This is an assignment-scale project: authentication is intentionally simple
(plain-text demo passwords, no real sessions) and the focus is on clean UI,
solid data analysis, and readable code rather than enterprise hardening.
