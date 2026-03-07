# Smart Reviewer

Users can:

- Search recent news
- Open a review from any article card
- Save article metadata, summaries, and sentiment

## Environment Variables

Create `.env.local` with:

```bash
GNEWS_API_KEY=your_gnews_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=smart-reviewer
```

`MONGODB_DB` is optional and defaults to `smart-reviewer`.

## Setup

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

### `GET /api/news?q=query`

Searches GNews and returns recent article metadata.

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

Returns all completed analyses.

## Async Processing Flow

1. Store the full article payload returned by the news API.
2. Trim content to roughly 5000 characters.
3. Generate the review output.
4. Save the result.
5. Update the job status for polling clients.

## Project Structure

```text
app/
  api/
  layout.tsx
  page.tsx
components/
  analysis-panel.tsx
  article-list.tsx
  results-table.tsx
  search-form.tsx
  smart-reviewer-dashboard.tsx
lib/
  ai.ts
  analysis-repository.ts
  analyze-job.ts
  api-client.ts
  article-id.ts
  env.ts
  gnews.ts
  mongodb.ts
  types.ts
```

## Notes

- Background analysis is started from the API route in-process, which is suitable for local development and a single Node runtime. For production, move job execution to a durable queue or worker.
