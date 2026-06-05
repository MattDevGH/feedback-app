# Feedback App

A professional feedback collector. Generate unique invite links for colleagues; they
answer questions across three categories (continue, stop, start). Drafts are saved
automatically. You view all submissions at `/admin` using a secret key link.

## Getting Started

```bash
npm install
cp .env.example .env.local           # fill in ADMIN_SECRET_KEY and POSTGRES_PRISMA_URL
npx prisma migrate deploy            # apply migrations to your Neon database
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Routes

| Route                    | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `/`                      | Landing page (directs users to use invite link)    |
| `/f/[token]`             | Feedback form (token-validated, draft persistence) |
| `/admin?key=`            | View all submitted feedback (requires admin key)   |
| `/unauthorized`          | Shown when admin key is missing or wrong           |
| `POST /api/feedback`     | Submit feedback (requires valid token in body)     |
| `GET /api/feedback?key=` | Retrieve all submissions (requires admin key)      |
| `POST /api/tokens?key=`  | Create a review token (requires admin key)         |
| `GET /api/tokens?key=`   | List all tokens and status (requires admin key)    |

## Generating Invite Links

```bash
curl -X POST "https://your-app.vercel.app/api/tokens?key=YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```

Share the returned token as: `https://your-app.vercel.app/f/<token>`

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

Tests use in-memory repositories — no database connection required.

## Formatting

```bash
npm run format        # format all files
npm run format:check  # check without writing (used in CI)
```

Pre-commit hook runs lint-staged automatically.

## Planned Features

- Admin UI for token management (create, view status, copy links)
- Anonymous submission option (mailto link to line manager)
- Email invites (auto-send invite link to a colleague's email)
- Request an invite (visitors submit email, admin approves)
- Additional question types (ratings, multiple choice)
