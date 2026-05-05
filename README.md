# Global Local QR & Payment Rails Intelligence Dashboard

Production-style MVP for a global intelligence dashboard covering local QR payments, instant payment rails, QR interoperability, PSP access, merchant coverage, crypto regulation and news updates.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run typecheck
npm run build
```

`npm run lint` is included, but newer Next.js versions may require replacing `next lint` with an ESLint CLI config if the command is removed by the installed Next release.

## Architecture

- `app/` - Next.js App Router pages: world overview, countries, country reports, interoperability, news and methodology.
- `components/` - reusable dashboard components: world map, filter bar, country report sections, matrix, news feed, badges and metric cards.
- `lib/types.ts` - canonical data model for country profiles, rails, corridors, participants, news, sources, opportunity scoring and data quality.
- `lib/data/` - seed/mock country, news and corridor data.
- `lib/utils/` - filtering, metrics, status normalization and formatting helpers.
- `lib/ingestion/` - safe future ingestion interfaces and mock daily update pipeline.

## Data status

All country profiles are seed/mock data for product and architecture validation. The UI explicitly marks the dataset as seed/mock. Placeholder source URLs must be replaced with official payment system, central bank, regulator, payment network, PSP and trusted media sources before commercial use.

## Future ingestion path

The ingestion layer reserves safe extension points for:

- RSS parsing from official feeds and fintech media.
- Official site/API ingestion where permitted by source terms.
- LLM summarization and entity extraction.
- Duplicate detection and source confidence scoring.
- Scheduled daily cron jobs.
- Database persistence and analyst review workflows.
# global-local-qr-payment-rails-dashboard
# global-local-qr-payment-rails-dashboard
