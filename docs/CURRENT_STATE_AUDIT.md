# Current State Audit

Date: 2026-07-10

## Summary

The repository was a static Next.js App Router prototype. It had strong product surface coverage for market profiles, country reports, a world map, a news page and an interoperability matrix, but the data source of truth was hard-coded TypeScript arrays.

Production data stopped updating because no production ingestion system existed. The previous `lib/ingestion/*` files contained placeholder sources, mock RSS output and comments describing future work. There was no database schema, no durable fetch state, no cron-protected scheduled endpoint, no deduplication persistence, no review queue and no canonical event model.

## Framework And Runtime

- Framework: Next.js App Router with React and TypeScript.
- Styling: Tailwind CSS v4 plus custom global CSS.
- Charts/icons: Recharts and lucide-react.
- Data model before this change: `lib/types.ts` plus static records under `lib/data/`.
- Hosting: deployed to Vercel at `https://global-local-qr-payment-rails-dashb.vercel.app/`.
- Database before this change: no database client or migrations present.
- Authentication before this change: none.
- Cron before this change: none.
- Tests before this change: `typecheck`, `lint`, `build` scripts existed; no test suite.

## Static Data Found

Hard-coded country, rail, company, corridor, news and metric data existed in:

- `lib/data/countries.ts`
- `lib/data/qr-systems.ts`
- `lib/data/news.ts`
- `lib/data/interoperability.ts`
- `components/world-map.tsx`
- dashboard metric derivations in `app/page.tsx`

The datasets were inconsistent:

- `lib/data/qr-systems.ts` used regions such as `Asia`, `Middle East`, `Latin America`, `Africa`, `Europe`, `CIS`.
- `lib/data/countries.ts` used broader regions such as `Asia-Pacific`, `Middle East & Africa`, `Europe & Central Asia`.
- News dates and update timestamps were generated from static dates in May 2026.
- Source links were placeholder `example.com` URLs.
- Mock source names were displayed in production views.

## Ingestion Status Before Change

The previous ingestion layer had:

- `sourceRegistry` with three placeholder sources.
- `parseRssSource()` returning one mock parsed update.
- `normalizeParsedUpdate()` converting mock updates to `NewsItem`.
- `runMockDailyUpdate()` with comments for future behavior.

No code fetched real sources, stored raw documents, clustered duplicates, extracted structured events, propagated changes or generated alerts.

## Design Status Before Change

The interface used a mostly neutral zinc palette with rounded cards. The supplied Inter-inspired design reference was not represented as a formal manifest. The previous UI did not include the required scalable IA: Companies, Regulation, Opportunities, Watchlists and Data Operations were missing.

## Implementation Decisions

- Supabase Postgres is now the production database target because it was explicitly allowed and fits Vercel/Supabase deployment.
- The UI reads `dashboard_projections`, which are derived from canonical entities and immutable intelligence events.
- Existing hard-coded records are retained only as a clearly marked `legacy_seed` fallback for local development and empty databases.
- No proprietary Inter logo or Citrina font is used.
- Vector search is deferred behind schema-compatible metadata because no embedding provider or vector extension is guaranteed in the current repository.
