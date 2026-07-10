type QueryValue = string | number | boolean | undefined

type SupabaseConfig = {
  url: string
  key: string
}

function getConfig(): SupabaseConfig | undefined {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return undefined
  return { url: url.replace(/\/$/, ""), key }
}

export function isSupabaseConfigured() {
  return Boolean(getConfig())
}

function headers(config: SupabaseConfig, prefer?: string) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

export function buildQuery(params: Record<string, QueryValue>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value))
  })
  return search.toString()
}

export async function supabaseSelect<T>(table: string, query = ""): Promise<T[]> {
  const config = getConfig()
  if (!config) return []
  const response = await fetch(`${config.url}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    headers: headers(config),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase select ${table} failed: ${response.status} ${await response.text()}`)
  return (await response.json()) as T[]
}

export async function supabaseUpsert<T extends Record<string, unknown>>(table: string, rows: T[], onConflict?: string) {
  const config = getConfig()
  if (!config || rows.length === 0) return []
  const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : ""
  const response = await fetch(`${config.url}/rest/v1/${table}${query}`, {
    method: "POST",
    headers: headers(config, "resolution=merge-duplicates,return=representation"),
    body: JSON.stringify(rows),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase upsert ${table} failed: ${response.status} ${await response.text()}`)
  return (await response.json()) as T[]
}

export async function supabaseInsert<T extends Record<string, unknown>>(table: string, rows: T[], prefer = "return=representation") {
  const config = getConfig()
  if (!config || rows.length === 0) return []
  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: "POST",
    headers: headers(config, prefer),
    body: JSON.stringify(rows),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase insert ${table} failed: ${response.status} ${await response.text()}`)
  return prefer.includes("return=representation") ? ((await response.json()) as T[]) : []
}

export async function supabaseRpc<T>(name: string, payload: Record<string, unknown> = {}) {
  const config = getConfig()
  if (!config) return undefined
  const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Supabase RPC ${name} failed: ${response.status} ${await response.text()}`)
  return (await response.json()) as T
}
