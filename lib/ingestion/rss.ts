import { parseFeedOrArticle } from "@/lib/ingestion/parsers"
import type { ParserResult, SourceRegistryRecord } from "@/lib/ingestion/sourceTypes"

export async function parseRssSource(source: SourceRegistryRecord, body: string, contentType = "application/xml"): Promise<ParserResult> {
  return parseFeedOrArticle(source, body, contentType)
}
