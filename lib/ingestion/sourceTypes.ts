import type { NewsItem, SourceReference } from "@/lib/types"

export type IngestionSource = {
  id: string
  name: string
  url: string
  countrySlug?: string
  sourceType: SourceReference["sourceType"]
  parserType: "rss" | "html" | "api" | "manual" | "unknown"
  reliability: "low" | "medium" | "high"
  checkFrequency: "daily" | "weekly" | "monthly" | "manual"
}

export type ParsedUpdate = {
  title: string
  url?: string
  sourceName: string
  publishedAt?: string
  countrySlugs: string[]
  categories: NewsItem["category"][]
  rawSummary?: string
  normalizedSummary?: string
  confidence: "low" | "medium" | "high"
}
