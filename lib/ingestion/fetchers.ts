import type { SourceRegistryRecord } from "@/lib/ingestion/sourceTypes"

const userAgent = "GlobalQRRailsIntel/1.0 (+https://global-local-qr-payment-rails-dashb.vercel.app)"

export async function fetchSource(source: SourceRegistryRecord) {
  const targetUrl = source.feedUrl ?? source.endpointUrl ?? source.url
  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/rss+xml, application/atom+xml, application/feed+json, application/json, text/html;q=0.8, */*;q=0.5",
    },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  })

  if (!response.ok) throw new Error(`Fetch failed for ${source.id}: ${response.status}`)
  const body = await response.text()
  return {
    url: response.url,
    contentType: response.headers.get("content-type") ?? "text/plain",
    etag: response.headers.get("etag") ?? undefined,
    lastModified: response.headers.get("last-modified") ?? undefined,
    body,
  }
}
