import type { NewsItem } from "@/lib/types"
import type { ParsedUpdate } from "@/lib/ingestion/sourceTypes"

export function normalizeParsedUpdate(update: ParsedUpdate): Omit<NewsItem, "id">[] {
  // Future: add LLM summarization, category classification, entity extraction,
  // related-country detection, duplicate clustering and source confidence scoring.
  return update.countrySlugs.map((countrySlug) => ({
    countrySlug,
    title: update.title,
    summary: update.normalizedSummary ?? update.rawSummary ?? "No summary available.",
    date: update.publishedAt ?? new Date().toISOString().slice(0, 10),
    sourceName: update.sourceName,
    sourceUrl: update.url,
    sourceType: "other",
    category: update.categories[0] ?? "other",
    whyItMattersForPsps: "Requires analyst review before this update is promoted to production intelligence.",
    confidence: update.confidence,
    parsedAt: new Date().toISOString(),
  }))
}
