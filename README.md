# Global Local QR & Payment Rails Intelligence

Production-oriented Next.js application for monitoring local QR payment systems, instant-payment rails, cross-border Scan-to-Pay interoperability, regulation, PSP access and BD opportunities.

The app now uses an event-driven model:

`source -> raw document -> normalized document -> story cluster -> intelligence event -> entity changes -> dashboard projections -> alerts`

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Without Supabase credentials, the UI runs in `legacy_seed` fallback mode. This is intentional: seed data is visibly marked as unverified and should not be treated as current intelligence.

## Environment Variables

- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` for server-side ingestion and projection writes
- `SUPABASE_ANON_KEY` for read-only server fallback if desired
- `CRON_SECRET` for protected scheduled endpoints
- `APP_BASE_URL` for local scripts that call cron routes
- `INTELLIGENCE_LLM_ENDPOINT`, `INTELLIGENCE_LLM_API_KEY`, `INTELLIGENCE_LLM_MODEL` reserved for a future grounded extraction provider

Never expose the service-role key or cron secret to the browser.

## Database

Apply the Supabase migration:

```bash
npm run db:migrate
npm run sources:seed
```

Migration created:

- `supabase/migrations/202607100001_intelligence_operating_system.sql`

It defines source registry/state, ingestion runs/errors, raw and normalized documents, story clusters, news, intelligence events/evidence, canonical entities, corridors, relationships, regulatory requirements, market snapshots, opportunity scores, watchlists, alert rules, generated alerts, review queue, dashboard projections and job leases.

## Ingestion

Core code:

- `lib/ingestion/fetchers.ts`
- `lib/ingestion/parsers.ts`
- `lib/ingestion/normalizers.ts`
- `lib/ingestion/deduplication.ts`
- `lib/ingestion/extraction.ts`
- `lib/ingestion/confidence.ts`
- `lib/ingestion/projections.ts`
- `lib/ingestion/pipeline.ts`

Scripts:

```bash
npm run sources:seed
npm run ingest:source -- npcil-upi-official
npm run ingest:priority
npm run ingest:all
npm run backfill
npm run projections:rebuild
npm run data:audit
```

The initial source registry is in `data/source-registry.json` and includes official central bank/scheme/operator sources plus trusted industry monitoring.

## Scheduled Jobs

Protected endpoints:

- `POST /api/cron/ingest?cadence=priority`
- `POST /api/cron/ingest?cadence=general`
- `POST /api/cron/ingest?sourceId=...`
- `POST /api/cron/process`
- `POST /api/cron/projections`
- `POST /api/cron/reconcile`
- `POST /api/cron/backfill?days=90`

Each request must include:

```http
Authorization: Bearer <CRON_SECRET>
```

Recommended cadence:

- priority official sources: every 1-2 hours
- general feeds: hourly
- discovery: every 4 hours
- reconciliation/projection rebuild: nightly
- source health: daily

Database job leases prevent overlapping scheduled invocations when Supabase is configured.

## Product Surface

- Overview
- Live Intelligence
- Markets
- Corridors
- Companies
- Regulation
- Opportunities
- Watchlists
- Data Operations
- Search

Dashboards read `dashboard_projections`; projections are rebuilt from canonical documents, clusters and intelligence events.

## Testing

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Backfill

```bash
npm run backfill
```

Backfill preserves source publication dates and event dates where available. It does not assign today’s date to old records.

## Troubleshooting

- If the UI shows `legacy_seed`, Supabase env vars are missing or no projections exist.
- If cron returns `401`, check `CRON_SECRET`.
- If ingestion creates documents but no events, inspect Data Operations and `ingestion_errors`.
- If sources fail repeatedly, check robots/source terms, rate limits and source URL changes.
