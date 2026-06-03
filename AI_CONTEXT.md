# AI Session Context

> Read this at the start of every session to resume without re-discovery.
>
> **Mandatory update rule:** Update both AI_CONTEXT.md and README.md as part of
> any commit that changes project structure, behaviour, test coverage, or conventions.

---

## Project

Professional feedback collector. Colleagues visit a unique link to submit free-text
feedback on what you do well and what you could improve. A private `/admin` page
(key-protected) shows all submitted responses.

**Repo:** https://github.com/MattDevGH/feedback-app
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
        route.ts          # POST (submit, public) + GET (list all, key-protected) feedback
    admin/
      page.tsx            # Server component — lists all feedback, newest first (key-protected)
    unauthorized/
      page.tsx            # Shown when admin key is missing or wrong
    page.tsx              # Client component — public feedback form (two questions)
    layout.tsx
    globals.css
  middleware.ts           # Protects /admin and GET /api/feedback with ADMIN_SECRET_KEY
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
    security/
      headers.test.ts     # Verifies security header config in next.config.ts
      middleware.test.ts  # Verifies admin key protection logic
prisma/
  schema.prisma           # Feedback model (id cuid, strengths, improvements, submittedAt)
  dev.db                  # SQLite database (gitignored)
  migrations/
    20260603154642_init/  # Initial migration — creates Feedback table
prisma.config.ts          # Prisma 7 datasource config (holds the db URL)
.env.local                # ADMIN_SECRET_KEY (gitignored — never commit)
.env.example              # Template showing required env vars (committed, no real values)
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

| Method | Path          | Auth       | Description                           |
|--------|---------------|------------|---------------------------------------|
| POST   | /api/feedback | none       | Submit feedback. 400 if fields blank or >2000 chars |
| GET    | /api/feedback | admin key  | Return all feedback (used by /admin)  |

---

## Pages

| Route         | Type   | Description                                              |
|---------------|--------|----------------------------------------------------------|
| /             | Client | Public feedback form (two free-text questions)           |
| /admin        | Server | View all submitted feedback, newest first (key-protected) |
| /unauthorized | Server | Shown when admin key is missing or incorrect             |

---

## Admin Access

Protected by a secret key in the query string: `/admin?key=<ADMIN_SECRET_KEY>`

- Key is stored in `.env.local` (gitignored)
- Must also be set as an environment variable on Vercel when deploying
- Middleware handles protection — fails closed if env var is unset
- Timing-safe comparison used to prevent key enumeration
- See `.env.example` for the variable name

To rotate the key: generate a new value with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
update `.env.local` and the Vercel env var.

---

## Test Coverage

- ui/page.test.tsx: form renders, disabled state, success flow, error flow, overlength error
- ui/accessibility.test.tsx: axe scan of feedback form
- security/headers.test.ts: security header config
- security/middleware.test.ts: admin key protection (valid, invalid, missing, sub-paths)
- api/items.test.ts: todo stubs (no DB integration tests yet)

npm test — single run (CI)
npm run test:watch — watch mode (TDD)

---

## Key Decisions & Reasoning

- Admin protected by secret key in query string — simple, no external auth dependency
- Query string keys can appear in server logs — acceptable at this scale; noted in code
- Middleware fails closed — if ADMIN_SECRET_KEY env var is unset, access is denied
- Timing-safe string comparison in middleware — prevents key enumeration attacks
- Admin page is a server component — reads DB directly, no client-side fetch needed
- No `url` in schema.prisma — Prisma 7 breaking change; URL configured in prisma.config.ts only
- Submit button disabled until both fields have content — prevents empty submissions client-side
- Feedback IDs use cuid() — suitable for future unique-link-per-reviewer feature

---

## Outstanding / Planned Work

- [ ] Unique per-reviewer links — token stored in DB, supports draft/resume, marks as submitted on completion
- [ ] Additional question types (rating scales, multiple choice, etc.)
- [ ] Mark questions as mandatory vs optional
- [ ] Email notification on new feedback submission
- [ ] Migrate DB to Vercel Postgres (Neon) when deploying to production
