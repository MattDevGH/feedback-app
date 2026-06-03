# Feedback App

A simple professional feedback collector. Share a link with colleagues; they submit free-text responses to two questions. You view all responses at `/admin`.

## Getting Started

```bash
npm install
npx prisma migrate dev --name init   # creates prisma/dev.db
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Routes

| Route        | Description                                      |
|--------------|--------------------------------------------------|
| `/`          | Public feedback form (two free-text questions)   |
| `/admin`     | View all submitted feedback, newest first        |
| `POST /api/feedback` | Submit feedback                        |
| `GET /api/feedback`  | Retrieve all feedback (used by /admin) |

## Tech Stack

- **Next.js 16** (App Router)
- **Prisma 7** + **better-sqlite3** (SQLite)
- **Tailwind CSS v4**
- **Vitest** + **React Testing Library** + **MSW** + **jest-axe**

## Testing

```bash
npm test          # single run
npm run test:watch  # watch mode
```

## Planned Features

- Auth-protected admin page
- Expiring share links
- Additional question types (ratings, multiple choice)
- Mandatory vs optional questions
- Email notifications on new submissions
