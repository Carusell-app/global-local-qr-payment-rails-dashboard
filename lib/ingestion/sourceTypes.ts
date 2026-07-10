import type {
  EvidenceReference,
  IngestionMethod,
  IntelligenceEvent,
  SourceRegistryRecord,
  SourceTrustTier,
  SourceType,
} from "@/lib/intelligence/types"

export type { IngestionMethod, SourceRegistryRecord, SourceTrustTier, SourceType }

export type RawDocumentInput = {
  id: string
  sourceId: string
  canonicalUrl: string
  normalizedUrl: string
  title: string
  publisher: string
  author?: string
  publishedAt?: string
  updatedAt?: string
  eventDate?: string
  language?: string
  excerpt?: string
  cleanText: string
  contentHash: string
  rawSnapshot?: string
  rawContentType?: string
  sourceTrustTier: SourceTrustTier
  originalCountry?: string
}

export type NormalizedDocument = RawDocumentInput & {
  documentType: "article" | "release" | "regulator_publication" | "json_feed_item" | "sitemap_entry" | "unknown"
  affectedCountries: string[]
  paymentRails: string[]
  companies: string[]
  regulators: string[]
  currencies: string[]
  topics: string[]
}

export type StoryCluster = {
  id: string
  primaryDocumentId: string
  title: string
  canonicalUrl: string
  earliestPublishedAt?: string
  authoritativeSourceId: string
  documentIds: string[]
  supportingSources: EvidenceReference[]
  conflictingClaims: string[]
  confidence: IntelligenceEvent["confidence"]
}

export type IngestionPipelineResult = {
  runId: string
  sourceIds: string[]
  fetched: number
  created: number
  duplicates: number
  clusters: number
  events: number
  errors: number
  startedAt: string
  finishedAt: string
}

export type ParserResult = {
  documents: RawDocumentInput[]
  errors: Array<{ sourceId: string; message: string; url?: string }>
}
