const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.log(JSON.stringify({ mode: "legacy_seed", warnings: ["Supabase is not configured; audit can only run after migrations and env setup."] }, null, 2))
  process.exit(0)
}

async function count(table, query = "select=id") {
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
  })
  if (!response.ok) return { table, error: await response.text() }
  return { table, count: Number(response.headers.get("content-range")?.split("/")[1] ?? 0) }
}

const checks = await Promise.all([
  count("source_registry"),
  count("raw_documents"),
  count("normalized_documents"),
  count("story_clusters"),
  count("intelligence_events"),
  count("dashboard_projections"),
  count("review_queue", "status=eq.open&select=id"),
])

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), checks }, null, 2))
