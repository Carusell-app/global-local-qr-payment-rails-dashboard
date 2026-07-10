const job = process.argv[2] ?? "ingest"
const sourceId = process.argv[3]

const routes = {
  ingest: "/api/cron/ingest?cadence=general",
  "ingest-priority": "/api/cron/ingest?cadence=priority",
  "ingest-discovery": "/api/cron/ingest?cadence=discovery",
  "ingest-source": `/api/cron/ingest?sourceId=${encodeURIComponent(sourceId ?? "")}`,
  process: "/api/cron/process",
  backfill: "/api/cron/backfill?days=90",
  projections: "/api/cron/projections",
  audit: "/api/cron/reconcile",
}

const route = routes[job]
if (!route) {
  console.error(`Unknown job "${job}". Known jobs: ${Object.keys(routes).join(", ")}`)
  process.exit(1)
}

if (job === "ingest-source" && !sourceId) {
  console.error("Usage: npm run ingest:source -- <source-id>")
  process.exit(1)
}

const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000"
const secret = process.env.CRON_SECRET
if (!secret) {
  console.error("CRON_SECRET is required")
  process.exit(1)
}

const response = await fetch(`${baseUrl}${route}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
})

const text = await response.text()
if (!response.ok) {
  console.error(text)
  process.exit(1)
}

console.log(text)
