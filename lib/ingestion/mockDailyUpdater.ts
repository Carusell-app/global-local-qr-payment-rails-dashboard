import { sourceRegistry } from "@/lib/ingestion/sourceRegistry"
import { parseRssSource } from "@/lib/ingestion/rss"
import { normalizeParsedUpdate } from "@/lib/ingestion/normalizers"

export async function runMockDailyUpdate() {
  // Future scheduled job:
  // 1. Fetch RSS/API/manual-source deltas.
  // 2. Parse official site pages only where allowed.
  // 3. Normalize with deterministic rules and optional LLM summaries.
  // 4. De-duplicate by URL, title similarity and affected country/system.
  // 5. Score source confidence and persist to database.
  // 6. Queue analyst review for low-confidence or high-risk updates.
  const parsed = await Promise.all(sourceRegistry.filter((source) => source.parserType === "rss").map(parseRssSource))
  return parsed.flat().flatMap(normalizeParsedUpdate)
}
