# AI Session Context

> Read this at the start of every session to resume without re-discovery.
>
> **Mandatory update rule:** Update both AI_CONTEXT.md and README.md as part of
> any commit that changes project structure, behaviour, test coverage, or conventions.

---

## Project

Professional feedback collector. Colleagues visit a link to submit free-text feedback
on what you do well and what you could improve. A private `/admin` page shows all
submitted responses.

**Repo:** [Replace with GitHub URL]
**Branch:** master (single branch, push directly)

---

## Stack

| Layer     | Choice                        | Notes |
|-----------|-------------------------------|-------|
| Framework | Next.js 16 (App Router)       | Read node_modules/next/dist/docs/ before writing Next-specific code |
| Language  | TypeScript (strict)           | No JS files in src/ |
| ORM       | Prisma 7 + better-sqlite3     | Driver adapter pattern. Config in prisma.config.ts. No `url` in schema.prisma — Prisma 7 breaking change |
| DB        | SQLite (prisma/dev.db)        | Gitignored. Migration applied: 20260603154642_init |
| Styling   | Tailwind CSS v4               | PostCSS plugin (@tailwindcss/postcss) |
| Testing   | Vitest + RTL + msw + jest-axe | See Testing section |
| CI        | GitHub Actions                | .github/workflows/ci.yml |

---

## File Structure

```
src/
  app/
    api/
      feedback/
        route.ts          # POST (submit) + GET (list all) feedback
    admin/
      page.tsx            # Server component — lists all feedback, newest first
    page.tsx              # Client component — public feedback form (two questions)
    layout.tsx
    globals.css
  lib/
    prisma.ts             # Singleton PrismaClient with BetterSqlite3 adapter
  generated/
    prisma/               # Auto-generated Prisma client (gitignored)
  tests/
    setup.ts              # msw server lifecycle
    mocks/
      handlers.ts         # msw handlers for /api/feedback (GET + POST)
      server.ts           # msw setupServer
    api/
      items.test.ts       # todo stubs for API route tests
    ui/
      page.test.tsx       # Feedback form: render, disabled state, submit flow, error state
      accessibility.test.tsx  # axe-core scan of feedback form
prisma/
  schema.prisma           # Feedback model (id cuid, strengths, improvements, submittedAt)
  dev.db                  # SQLite database (gitignored)
  migrations/
    20260603154642_init/  # Initial migration — creates Feedback table
prisma.config.ts          # Prisma 7 datasource config (holds the db URL)
```

---

## Prisma Schema

```prisma
model Feedback {
  id           String   @id @default(cuid())
  strengths    String
  improvements String
  submittedAt  DateTime @default(now())
}
```

**Important Prisma 7 note:** The `datasource` block in `schema.prisma` must NOT contain
a `url` field. The connection URL lives only in `prisma.config.ts`.

---

## API

| Method | Path           | Auth | Description                          |
|--------|----------------|------|--------------------------------------|
| POST   | /api/feedback  | none | Submit feedback. 400 if fields blank |
| GET    | /api/feedback  | none | Return all feedback (for admin page) |

---

## Pages

| Route   | Type   | Description                                         |
|---------|--------|-----------------------------------------------------|
| /       | Client | Public feedback form (two free-text questions)      |
| /admin  | Server | View all submitted feedback, newest first (unprotected for now) |

---

## Test Coverage

- ui/page.test.tsx: form renders, submit button disabled state, success flow, error flow
- ui/accessibility.test.tsx: axe scan of feedback form
- api/items.test.ts: todo stubs (no DB integration tests yet)

npm test — single run (CI)
npm run test:watch — watch mode (TDD)

---

## Key Decisions & Reasoning

- Admin page is a server component — reads DB directly, no client-side fetch needed
- Admin page is currently **unprotected** — authentication is planned for a future iteration
- No `url` in schema.prisma — Prisma 7 breaking change; URL configured in prisma.config.ts only
- Submit button disabled until both fields have content — prevents empty submissions client-side
- Feedback IDs use cuid() — suitable for future expiring-link feature

---

## Outstanding / Planned Work

- [ ] Auth for /admin (protect so only you and chosen others can view feedback)
- [ ] Expiring share links to limit how many times someone can respond
- [ ] Additional question types (rating scales, multiple choice, etc.)
- [ ] Mark questions as mandatory vs optional
- [ ] Email notification on new feedback submission
