import type { IngestionSource, ParsedUpdate } from "@/lib/ingestion/sourceTypes"

export async function parseRssSource(source: IngestionSource): Promise<ParsedUpdate[]> {
  // Future: connect a compliant RSS parser here.
  // Keep fetching source-owned RSS feeds only; do not bypass publisher controls.
  // Add timeout, ETag/Last-Modified support and duplicate detection before persistence.
  return [
    {
      title: `Mock parsed RSS update from ${source.name}`,
      url: source.url,
      sourceName: source.name,
      publishedAt: "2026-05-05",
      countrySlugs: source.countrySlug ? [source.countrySlug] : [],
      categories: ["other"],
      rawSummary: "Placeholder RSS item.",
      normalizedSummary: "Mock normalized update reserved for real ingestion.",
      confidence: source.reliability,
    },
  ]
}
