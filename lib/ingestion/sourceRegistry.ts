import type { IngestionSource } from "@/lib/ingestion/sourceTypes"

export const sourceRegistry: IngestionSource[] = [
  {
    id: "mock-official-systems",
    name: "Official payment system pages placeholder",
    url: "https://example.com/payment-system-registry",
    sourceType: "official_system_site",
    parserType: "manual",
    reliability: "medium",
    checkFrequency: "weekly",
  },
  {
    id: "mock-central-bank-rss",
    name: "Central bank RSS placeholder",
    url: "https://example.com/central-bank-rss.xml",
    sourceType: "central_bank",
    parserType: "rss",
    reliability: "high",
    checkFrequency: "daily",
  },
  {
    id: "mock-fintech-media",
    name: "Fintech media monitor placeholder",
    url: "https://example.com/fintech-media-feed",
    sourceType: "fintech_media",
    parserType: "rss",
    reliability: "low",
    checkFrequency: "daily",
  },
]

// Future: store sources in a database with country, language, crawl policy,
// robots-aware fetch settings, parser ownership and validation workflow state.
