import fs from "node:fs/promises"

const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
  process.exit(1)
}

const sources = JSON.parse(await fs.readFile(new URL("../data/source-registry.json", import.meta.url), "utf8"))
const rows = sources.map((source) => ({
  id: source.id,
  canonical_name: source.name,
  domain: source.domain,
  source_type: source.sourceType,
  trust_tier: source.trustTier,
  countries_covered: source.countriesCovered,
  languages: source.languages,
  topics: source.topics,
  ingestion_method: source.ingestionMethod,
  feed_url: source.feedUrl,
  endpoint_url: source.endpointUrl,
  crawl_frequency_minutes: source.crawlFrequencyMinutes,
  parser_config: source.parserConfig ?? {},
  rate_limit_per_minute: source.rateLimitPerMinute,
  enabled: source.enabled,
  freshness_status: "unknown",
  review_status: "approved",
  confidence: source.trustTier === 1 ? 0.9 : source.trustTier === 2 ? 0.75 : 0.55,
  last_verified_at: new Date().toISOString(),
}))

const response = await fetch(`${url}/rest/v1/source_registry?on_conflict=id`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(rows),
})

if (!response.ok) {
  console.error(await response.text())
  process.exit(1)
}

const written = await response.json()
console.log(JSON.stringify({ seeded: written.length }, null, 2))
