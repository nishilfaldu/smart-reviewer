# Smart Reviewer

A single-page web app that searches real-time news articles, generates AI-powered summaries with sentiment analysis, and stores structured results in MongoDB.

**Tech stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · MongoDB · OpenAI (via Vercel AI SDK) · Zod · React Query

Users can:

- Search recent news articles via GNews
- Select any article to trigger an AI review (summary + sentiment)
- Browse all completed reviews in a dedicated archive with filters and pagination

## Environment Variables

Copy the template and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `GNEWS_API_KEY` | Yes | API key from [gnews.io](https://gnews.io/) |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_MODEL` | No | Model name, defaults to `gpt-4.1-mini` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | No | Database name, defaults to `smart-reviewer` |

## Setup

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

The app runs on any platform that supports Next.js (Vercel, Railway, Render, etc.):

1. Push the repo to GitHub.
2. Connect the repo to your hosting platform.
3. Set the environment variables listed above.
4. Deploy — the platform will run `next build` automatically.

For Vercel specifically, no extra config is needed.

## API Routes

### `GET /api/news?q=query&page=1`

Searches GNews and returns paginated article metadata. Results are cached in-memory for 5 minutes to conserve the 100 requests/day free-tier limit.

| Param | Required | Description |
|---|---|---|
| `q` | Yes | Search query |
| `page` | No | Page number, defaults to `1` |

### `POST /api/analyze`

Input:

```json
{
  "article": {
    "id": "news-api-id",
    "title": "Article title",
    "description": "Article description",
    "content": "Article content from the news API",
    "url": "https://example.com/article",
    "image": "https://example.com/image.jpg",
    "publishedAt": "2025-09-30T19:38:25Z",
    "lang": "en",
    "source": {
      "id": "source-id",
      "name": "Source name",
      "url": "https://example.com",
      "country": "us"
    }
  }
}
```

Behavior:

- Creates a deterministic SHA-256 id from the normalized article URL
- Reuses an existing analysis if one already exists
- Otherwise stores a pending record and starts the async processing pipeline

### `GET /api/result/[id]`

Returns the status and result for one analysis job.

### `GET /api/results`

Returns paginated, filterable completed analyses.

| Param | Required | Description |
|---|---|---|
| `page` | No | Page number, defaults to `1` |
| `q` | No | Search across title, publisher, description, and summary |
| `sentiment` | No | Filter by sentiment level (e.g. `positive`, `very_negative`) |
| `dateFrom` | No | Filter articles published on or after this date |
| `dateTo` | No | Filter articles published on or before this date |

## Async Processing Flow

1. Store the full article payload returned by the news API.
2. Trim content to roughly 5000 characters.
3. Generate the review output (summary + sentiment) in a single structured API call.
4. Save the result to MongoDB.
5. Update the job status for polling clients.

## Sentiment Classification

Sentiment is classified on a five-level scale: **very positive**, **positive**, **neutral**, **negative**, and **very negative**. The AI prompt includes descriptions for each level to keep classifications consistent. The scale can be adjusted by editing the Zod enum in `schemas.ts` and updating the prompt in `ai.ts`.

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

## Notes

- **Background processing**: Analysis jobs are started in-process from the API route, which works well for local development and a single Node runtime. For production, move job execution to a durable queue (e.g., BullMQ, Inngest) or a serverless task runner.
- **GNews caching**: Search results are held in a short-lived in-memory cache (5 min TTL) to stay within the free-tier rate limit. A persistent cache (Redis, edge KV) would be more robust in production.
- **Pagination**: Both news search and the reviews archive use server-side pagination. Switching the reviews archive from skip/limit to cursor-based pagination would improve performance at very large scale.
- **Testing**: Unit and integration tests (Vitest + React Testing Library) for API routes and components would be a natural next step.
- **Authentication**: There is no auth layer — any visitor can trigger analyses and view results. Adding NextAuth or Clerk would gate access appropriately.
- **Docker Compose**: A `docker-compose.yml` with MongoDB would make local setup zero-config for contributors.
