# Feedback App

A professional feedback collector. Share a link with colleagues; they answer questions
across three categories (praise, criticism, suggestions). You view all submissions at
`/admin` using a secret key link.

## Getting Started

```bash
npm install
cp .env.example .env.local           # fill in ADMIN_SECRET_KEY and POSTGRES_PRISMA_URL
npx prisma migrate deploy            # apply migrations to your Neon database
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Routes

| Route                    | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `/`                      | Public feedback form (9 questions, 3 categories) |
| `/admin?key=`            | View all submitted feedback (requires admin key) |
| `/unauthorized`          | Shown when admin key is missing or wrong         |
| `POST /api/feedback`     | Submit feedback (public, validated by Zod)       |
| `GET /api/feedback?key=` | Retrieve all submissions (requires admin key)    |

## Admin Access

Protected by a secret key in `.env.local`:

```
ADMIN_SECRET_KEY=your-secret-here
```

Generate a key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then visit `/admin?key=<your-secret>`.

On Vercel: add `ADMIN_SECRET_KEY` in **Project Settings → Environment Variables**.

## Tech Stack

- **Next.js 16** (App Router)
- **Prisma 7** + **Neon serverless** (PostgreSQL)
- **Zod** for API input validation
- **Tailwind CSS v4**
- **Vitest** + **React Testing Library** + **MSW** + **jest-axe**
- **Prettier** + **Husky** + **lint-staged** (formatting enforced at commit time)

## Testing

```bash
npm test            # single run (CI)
npm run test:watch  # watch mode (TDD)
```

Tests use an in-memory repository — no database connection required.

## Formatting

```bash
npm run format        # format all files
npm run format:check  # check without writing (used in CI)
```

Pre-commit hook runs lint-staged automatically.

## Planned Features

- Unique per-reviewer links (draft/resume support, one submission per person)
- Anonymous submission option (mailto link to line manager)
- Additional question types (ratings, multiple choice)
- Interleaved colour-coded question UI
