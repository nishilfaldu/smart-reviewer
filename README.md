# Smart Reviewer

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Query](https://img.shields.io/badge/React%20Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-000000?style=flat-square&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)

> A take-home project I built for Aries Global, a London-based company, for an engineering interview. The brief: search recent news, have an LLM review an article, and let people browse past reviews. This is what I shipped.

Search recent news, open any article into an AI review (a summary plus a sentiment rating), and browse everything you have reviewed in a filterable archive. Reviews run as background jobs and the UI polls until they land, so a slow model call never blocks the page.

## Quick start

```bash
cp .env.example .env.local   # then fill in the keys below
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Required | Default | Notes |
|---|---|---|---|
| `GNEWS_API_KEY` | yes | — | Key from [GNews](https://gnews.io/) |
| `OPENAI_API_KEY` | yes | — | OpenAI key |
| `MONGODB_URI` | yes | — | Atlas or local connection string |
| `OPENAI_MODEL` | no | `gpt-4.1-mini` | Override the model |
| `MONGODB_DB` | no | `smart-reviewer` | Database name |

## How it works

```text
Search ─▶ GET /api/news ─────────────────▶ GNews
  │
  └─ open article ─▶ POST /api/analyze ──▶ MongoDB (upsert review record)
                          │                    │
                          │                    └─ background job: OpenAI summary + sentiment
                          ▼
                     client polls GET /api/result/[id] until done | error

Archive ─▶ GET /api/results ─────────────▶ MongoDB (filter by query, sentiment, date)
```

Each review is one MongoDB document keyed by a deterministic id derived from the article URL, so opening the same article twice reuses the existing record instead of duplicating it. Status moves through `pending -> processing -> done | error`, and the client polls until it settles. Failed or completed reviews can be re-run on demand.

The archive page (`/reviews`) keeps its filters in the URL and converts the user's local-day date selections into exact UTC boundaries before querying.

## Layout

```text
app/
  api/            news, analyze, result/[id], results route handlers
  page.tsx        search + review flow
  reviews/        archive page
components/        articles, review dialog, reviews dashboard, ui primitives
lib/              gnews, ai, mongodb, repository + document mapping, schemas
```

## What I would do next

A few things I scoped out to keep the take-home focused:

- **Full-text extraction** — reviews currently use GNews's truncated `content`. Fetching the article and pulling the body with Readability would make them noticeably better for open sources.
- **Durable job queue** — analysis runs via `after()` on the request. A real queue would survive deploys and retry on failure.
- **Auth + rate limiting** — right now anyone can hit the app and spend OpenAI credits; GNews 403/429s also surface as a generic error.
- **Cursor pagination** — the archive uses skip/limit; a cursor on `(createdAt, _id)` keeps deep pages fast.
- **Tests** — Vitest for the repository and routes, Testing Library for the review flow.
