# Smart Reviewer

Smart Reviewer is a Next.js app for searching recent news, generating an AI review for an article, and browsing completed reviews in a separate archive.

It is built with Next.js App Router, React, TypeScript, Tailwind CSS, MongoDB, React Query, Zod, and the Vercel AI SDK.

## What It Does

- Search recent articles from GNews
- Open any article in a review modal
- Generate a summary and sentiment classification
- Retry failed reviews
- Refresh completed reviews and overwrite the stored article fields with the latest payload you opened
- Browse completed reviews on `/reviews` with filters and pagination

## Setup

Create a local env file:

```bash
cp .env.example .env.local
```

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GNEWS_API_KEY` | Yes | API key from [GNews](https://gnews.io/) |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_MODEL` | No | Model name, defaults to `gpt-4.1-mini` |
| `MONGODB_URI` | Yes | MongoDB Atlas or MongoDB connection string |
| `MONGODB_DB` | No | Database name, defaults to `smart-reviewer` |

## Review Flow

1. Search for articles on the main page.
2. Open an article review.
3. The app calls `POST /api/analyze` to ensure a review exists and to get its latest state.
4. If the review is still running, the client polls until it reaches `done` or `error`.
5. Completed reviews can be refreshed. Failed reviews can be retried.

## API Summary

### `GET /api/news?q=query&page=1`

Searches GNews and returns paginated article results.

| Param | Required | Description |
|---|---|---|
| `q` | Yes | Search query |
| `page` | No | Page number, defaults to `1` |

### `POST /api/analyze`

Ensures an analysis exists for the article URL and returns the current record.

Request body:

```json
{
  "article": {
    "id": "news-api-id",
    "title": "Article title",
    "description": "Article description",
    "content": "Article content from GNews",
    "url": "https://example.com/article",
    "image": "https://example.com/image.jpg",
    "publishedAt": "2026-03-08T10:30:00Z",
    "lang": "en",
    "source": {
      "id": "source-id",
      "name": "Source name",
      "url": "https://example.com",
      "country": "us"
    }
  },
  "retry": false,
  "refresh": false
}
```

Behavior:

- New article: creates a pending record and starts the review
- Existing `pending` or `processing` record: returns current status
- Existing `error` record: returns current status unless `retry: true`
- Existing `done` record: returns current status unless `refresh: true`

### `GET /api/result/[id]`

Returns the current state for one review.

### `GET /api/results?page=1&q=&sentiment=&publishedFrom=&publishedTo=`

Returns paginated completed reviews.

| Param | Required | Description |
|---|---|---|
| `page` | No | Page number, defaults to `1` |
| `q` | No | Search across title, description, source name, and summary |
| `sentiment` | No | One of `very_positive`, `positive`, `neutral`, `negative`, `very_negative` |
| `publishedFrom` | No | Lower UTC timestamp boundary |
| `publishedTo` | No | Upper UTC timestamp boundary |

Note: the `/reviews` page keeps `dateFrom` and `dateTo` in the browser URL for the UI, then converts those local-day selections into exact UTC boundaries before calling `/api/results`.

## Data Model

Each stored review keeps:

- Deterministic `_id` derived from the normalized article URL
- Flattened article fields from GNews
- Review output: `summary` and `sentiment`
- Status: `pending`, `processing`, `done`, or `error`
- Document timestamps: `createdAt` and `updatedAt`

## Project Structure

```text
app/
  api/
    analyze/route.ts
    news/route.ts
    result/[id]/route.ts
    results/route.ts
  reviews/page.tsx
  globals.css
  layout.tsx
  page.tsx
  providers.tsx
components/
  articles/
    article-card.tsx
    article-list.tsx
  layout/
    site-shell.tsx
  review-dialog/
    article-review-flow.tsx
    article-review-modal.tsx
    review-completed-state.tsx
    review-error-state.tsx
    review-progress-state.tsx
  reviews/
    review-archive-card.tsx
    review-archive-table.tsx
    reviews-dashboard.tsx
    reviews-filters.tsx
  search/
    search-form.tsx
    smart-reviewer-dashboard.tsx
  ui/
    base-dialog.tsx
    base-dialog-close.tsx
    base-dialog-content.tsx
    base-dialog-context.tsx
    pagination-controls.tsx
lib/
  ai.ts
  analysis-document.ts
  analysis-repository.ts
  analyze-job.ts
  api-client.ts
  article-id.ts
  display.ts
  env.ts
  gnews.ts
  mongodb.ts
  news-cache.ts
  schemas.ts
  types.ts
  use-modal-behavior.ts
```

## Practical Notes

- Reviews are based on the GNews article payload, especially its `content` field. If that source text is truncated or stale, the review will be too.
- `articlePublishedAt` comes from the article payload. `createdAt` and `updatedAt` belong only to the stored review document.
- The reviews page filters by the user's local day in the UI, then sends exact UTC timestamp boundaries to the backend.
- External article images may fail on some publishers because of mixed-content rules or source-side blocking.
- Review jobs are started from the API route and claimed atomically in MongoDB. That is fine for this app, but a durable job system would be a better production architecture at larger scale.

## Deployment

The app can run on platforms like Vercel, Railway, or Render:

1. Push the repo to GitHub.
2. Connect the repo to your host.
3. Add the environment variables above.
4. Deploy.

For MongoDB Atlas, use the full Atlas connection string exactly as generated and make sure the database user and IP/network rules are configured correctly.

## What I'd Improve

- **Full-text extraction**: Right now reviews are based on GNews's truncated `content` field. I'd fetch the article URL server-side and pull the full body with `jsdom` + `@mozilla/readability`. Won't help with paywalled sites like Bloomberg or WSJ, but for open sources the reviews would be much better.
- **Job queue**: Analysis jobs run inside `after()` on the API route. A real queue would let them survive deploys and retry on failure.
- **News caching**: The in-memory GNews cache (`lib/news-cache.ts`) doesn't help much on serverless since each container gets a fresh Map. Redis or Vercel KV would actually persist across cold starts.
- **Rate-limit handling**: When GNews returns 403/429 the user just sees a generic error. Should detect it and show something like "Daily search limit reached — try again tomorrow."
- **Cursor pagination**: Reviews use skip/limit which gets slow on large collections. Cursor on `createdAt` + `_id` would keep page 100 as fast as page 1.
- **Tests**: No tests yet. Would add Vitest for the repository and API routes, React Testing Library for the review flow.
- **Auth**: Anyone can hit the app and burn OpenAI credits. Needs an auth layer.
- **Docker Compose**: A `docker-compose.yml` with MongoDB would make local setup one command.
