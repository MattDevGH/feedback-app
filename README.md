# Feedback App

A simple professional feedback collector. Share a link with colleagues; they submit
free-text responses to two questions. You view all responses at `/admin` using a
secret key link.

## Getting Started

```bash
npm install
npx prisma migrate dev --name init   # creates prisma/dev.db
cp .env.example .env.local           # then fill in ADMIN_SECRET_KEY
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Routes

| Route                    | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `/`                      | Public feedback form (two free-text questions)   |
| `/admin?key=`            | View all submitted feedback (requires admin key) |
| `/unauthorized`          | Shown when admin key is missing or wrong         |
| `POST /api/feedback`     | Submit feedback (public)                         |
| `GET /api/feedback?key=` | Retrieve all feedback (requires admin key)       |

## Admin Access

The `/admin` page is protected by a secret key stored in `.env.local`:

```
ADMIN_SECRET_KEY=your-secret-here
```

Generate a key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then visit `/admin?key=<your-secret>`.

To add the key in Vercel: **Project Settings → Environment Variables**.

## Tech Stack

- **Next.js 16** (App Router)
- **Prisma 7** + **better-sqlite3** (SQLite locally; migrate to Vercel Postgres for production)
- **Tailwind CSS v4**
- **Vitest** + **React Testing Library** + **MSW** + **jest-axe**

## Testing

```bash
npm test          # single run
npm run test:watch  # watch mode
```

## Planned Features

- Unique per-reviewer links (draft/resume support, one submission per person)
- Additional question types (ratings, multiple choice)
- Mandatory vs optional questions
- Email notifications on new submissions
