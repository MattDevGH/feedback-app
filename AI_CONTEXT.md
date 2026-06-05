# AI Session Context

> Read this at the start of every session to resume without re-discovery.
>
> **Mandatory update rule:** Update both AI_CONTEXT.md and README.md as part of
> any commit that changes project structure, behaviour, test coverage, or conventions.
> Also check off any completed items in the Outstanding / Planned Work list.
>
> **Enforced by:** a Kiro `agentStop` hook that reminds the agent to verify these files
> are current before finishing. Do not dismiss the reminder without checking.

---

## Project

Professional feedback collector. Colleagues visit a unique link to submit free-text
feedback on what you do well and what you could improve. A private `/admin` page
(key-protected) shows all submitted responses.

**Repo:** https://github.com/MattDevGH/feedback-app
**Branch:** master (single branch, push directly)

---

## Code Principles

Code should read like well-written prose (Feathers). Follow Clean Code (Robert C. Martin):

- **Small functions** — each does one thing, named to describe what it does
- **Separate concerns** — validation in `validation.ts`, state management in hooks, rendering in components, persistence behind the repository interface
- **No duplication** — shared logic (e.g. `validateSubmission`, `isSectionComplete`) is defined once and imported where needed. MSW handlers reuse the same validation as the real API.
- **Names tell the truth** — files, functions, variables should make the code self-documenting
- **Extract, don't inline** — if logic requires a comment to explain, extract it into a named function instead
- **Zod for validation** — declarative schemas replace manual type-checking. No `as` casts for untrusted input.
- **Prettier enforced** — formatting is never a discussion. Pre-commit hook ensures consistency.

---

## Stack

| Layer      | Choice                        | Notes                                                                                                                                                                                                                |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router)       | Read node_modules/next/dist/docs/ before writing Next-specific code                                                                                                                                                  |
| Language   | TypeScript (strict)           | No JS files in src/                                                                                                                                                                                                  |
| ORM        | Prisma 7 + Neon serverless    | Driver adapter pattern. Config in prisma.config.ts. No `url` in schema.prisma — Prisma 7 breaking change. `postinstall` runs `prisma generate` for Vercel/fresh clones. **Run manually after local schema changes.** |
| DB         | PostgreSQL (Neon)             | Hosted on Neon via Vercel integration. Same DB for local dev and production. For offline dev, use a local Postgres container (see Local Development).                                                                |
| Validation | Zod                           | Schema-based validation for API input. Shared between route handlers and MSW mocks.                                                                                                                                  |
| Styling    | Tailwind CSS v4               | PostCSS plugin (@tailwindcss/postcss)                                                                                                                                                                                |
| Testing    | Vitest + RTL + msw + jest-axe | See Testing section                                                                                                                                                                                                  |
| Formatting | Prettier                      | Enforced via pre-commit hook (Husky + lint-staged). `npm run format` to format manually.                                                                                                                             |
| CI         | GitHub Actions                | .github/workflows/ci.yml                                                                                                                                                                                             |

---

## File Structure

```
src/
  app/
    api/
      feedback/
        route.ts          # POST (submit, token-validated) + GET (list all, key-protected)
      tokens/
        route.ts          # POST (create token) + GET (list tokens) — admin-protected
    admin/
      page.tsx            # Server component — lists all feedback (key-protected)
      error.tsx           # Error boundary for admin page
    f/
      [token]/
        page.tsx          # Server component — validates token, renders form or status
        FeedbackForm.tsx  # Client component — the actual feedback form
    hooks/
      useFeedbackForm.ts  # Custom hook — form state, draft persistence, submission
    error.tsx             # Root error boundary
    unauthorized/
      page.tsx            # Shown when admin key is missing or wrong
    page.tsx              # Landing page (directs to invite link)
    layout.tsx
    globals.css
  proxy.ts                # Protects /admin, /api/tokens, GET /api/feedback
  lib/
    prisma.ts             # Singleton PrismaClient with Neon adapter
    validation.ts         # Zod schema + validateSubmission() for API input
    repositories/
      feedback.repository.ts         # FeedbackRepository interface + types
      token.repository.ts            # TokenRepository interface + types
      prisma-feedback.repository.ts  # Prisma/Neon implementation (feedback)
      prisma-token.repository.ts     # Prisma/Neon implementation (tokens)
      memory-feedback.repository.ts  # In-memory implementation (tests)
      memory-token.repository.ts     # In-memory implementation (tests)
      index.ts                       # Factory: getFeedbackRepository(), getTokenRepository()
    questions.config.ts              # Static question bank + section completion logic
  generated/
    prisma/               # Auto-generated Prisma client (gitignored)
  tests/
    setup.ts              # msw server lifecycle
    mocks/
      handlers.ts         # msw handlers — reuses validateSubmission()
      server.ts           # msw setupServer
    api/
      feedback.test.ts    # Feedback submission route tests
      tokens.test.ts      # Token creation/listing route tests
    ui/
      page.test.tsx       # Feedback form + landing page UI tests
      accessibility.test.tsx  # axe-core scan
    security/
      headers.test.ts     # Security header config tests
      middleware.test.ts  # Admin key protection tests
prisma/
  schema.prisma           # ReviewToken + FeedbackSubmission + FeedbackResponse (PostgreSQL)
  migrations/             # Postgres migrations
prisma.config.ts          # Prisma CLI config (datasource URL)
.env.local                # ADMIN_SECRET_KEY + POSTGRES_PRISMA_URL (gitignored)
.env.example              # Template (committed, no real values)
```

.prettierrc # Prettier config
.prettierignore # Prettier ignore patterns
.husky/pre-commit # Runs lint-staged before each commit

````

---

## Prisma Schema

```prisma
model FeedbackSubmission {
  id          String             @id @default(cuid())
  submittedAt DateTime           @default(now())
  responses   FeedbackResponse[]
}

model FeedbackResponse {
  id           String             @id @default(cuid())
  submissionId String
  submission   FeedbackSubmission @relation(...)
  questionKey  String
  value        String
}
````

---

## Question Config

Questions live in `src/lib/questions.config.ts`. Edit this file to change questions.
No other files need to change.

**Section completion rule:**

- If mandatory questions exist in a section → all must be answered
- If no mandatory questions exist → at least one must be answered

Current questions: praise-1 (mandatory), praise-2, praise-3, criticism-1 (mandatory), criticism-2, criticism-3, suggestion-1 (mandatory), suggestion-2, suggestion-3

User-facing labels use **stop/start/continue** framing (not praise/criticism/suggestion) — it's more action-oriented and less awkward for the person giving feedback.

---

## API

| Method | Path          | Auth      | Description                                                  |
| ------ | ------------- | --------- | ------------------------------------------------------------ |
| POST   | /api/feedback | token     | Submit feedback. Requires valid token + Zod + section rules. |
| GET    | /api/feedback | admin key | Return all submissions with responses.                       |
| POST   | /api/tokens   | admin key | Create a new review token (name + optional expiry).          |
| GET    | /api/tokens   | admin key | List all tokens with their status.                           |

---

## Pages

| Route         | Type   | Description                                                 |
| ------------- | ------ | ----------------------------------------------------------- |
| /             | Server | Landing page — directs users to use their invite link       |
| /f/[token]    | Server | Token-validated feedback form (draft saved to localStorage) |
| /admin        | Server | View all submitted feedback (key-protected)                 |
| /unauthorized | Server | Shown when admin key is missing or incorrect                |

---

## Admin Access

Protected by a secret key in the query string: `/admin?key=<ADMIN_SECRET_KEY>`

- Key stored in `.env.local` (gitignored) and as a Vercel env var
- Proxy fails closed — if env var is unset, access is denied
- Timing-safe comparison prevents key length and value leakage

To rotate: generate a new value, update `.env.local` and the Vercel env var.

---

## Local Development

Local dev connects to the same Neon Postgres database via `POSTGRES_PRISMA_URL` in `.env.local`.

**For fully offline development**, use a local Postgres container:

```bash
docker run -p 5432:5432 -e POSTGRES_PASSWORD=local postgres:16
```

Set `POSTGRES_PRISMA_URL=postgresql://postgres:local@localhost:5432/postgres` and run `npx prisma migrate deploy`.

**Do NOT reintroduce SQLite** — dual-provider schemas cause migration conflicts with Prisma 7.

**After setting `$env:` variables in PowerShell**, close the terminal before running `npm run dev` to avoid stale values overriding `.env.local`.

---

## Test Coverage

**Approach: TDD**

Write tests before or alongside implementation. For API routes, validation logic, and business rules, write the failing test first then implement. UI tests are written alongside since the component shape drives what's testable. Do not write implementation first and retrofit tests.

- api/feedback.test.ts: feedback submission route tests (token validation, section completion, edge cases)
- api/tokens.test.ts: token creation and listing route tests
- ui/page.test.tsx: landing page + feedback form UI tests (render, disabled state, success, error, section indicators)
- ui/accessibility.test.tsx: axe scan of feedback form
- security/headers.test.ts: security header config
- security/middleware.test.ts: admin key protection

`npm test` — single run (CI)
`npm run test:watch` — watch mode (TDD)

---

## Key Decisions & Reasoning

- Repository pattern — application logic depends on `FeedbackRepository` interface only
- Zod for validation — declarative, self-documenting, shared between API and MSW
- Custom hook (`useFeedbackForm`) — separates state/logic from presentation
- MSW handlers reuse `validateSubmission()` — no drift, no duplication
- Error boundaries — friendly error pages, never raw crashes
- Prettier + Husky + lint-staged — formatting enforced at commit time
- No `as` casts for untrusted input — Zod handles parsing and narrowing
- Admin protected by secret key in query string — simple, no external auth dependency
- Proxy fails closed — if ADMIN_SECRET_KEY is unset, access is denied
- Admin page is a server component — reads DB directly
- Feedback IDs use cuid() — suitable for future unique-link-per-reviewer feature

---

## Outstanding / Planned Work

- [ ] Anonymous submission option — "submit anonymously" checkbox; presents a mailto link to line manager with feedback content pre-filled. App records submission as anonymous (no token correlation in admin view). Explanatory text describes what "anonymous" means in this context.
- [ ] Additional question types (rating scales, multiple choice, etc.)
- [ ] Email invites — generate a token in admin with a user's email address, send them an invite link automatically (requires email service e.g. Resend)
- [ ] Request an invite — public landing page allows visitors to submit their email to request access. Admin approves/rejects requests and issues tokens.
- [ ] Admin UI for token management — create tokens, view status, copy invite links
