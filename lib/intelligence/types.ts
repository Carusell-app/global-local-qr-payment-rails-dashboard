import type { Confidence, CountryPaymentProfile, InteroperabilityCorridor, NewsItem } from "@/lib/types"

export type DataMode = "database" | "legacy_seed"

export type SourceTrustTier = 1 | 2 | 3 | 4

export type SourceType =
  | "central_bank"
  | "regulator"
  | "government"
  | "scheme_operator"
  | "payment_operator"
  | "company"
  | "industry_media"
  | "international_body"
  | "discovery"

export type IngestionMethod =
  | "rss"
  | "atom"
  | "json_feed"
  | "rest_api"
  | "sitemap"
  | "html"
  | "regulator_list"
  | "search_discovery"
  | "manual"

export type FreshnessStatus = "fresh" | "due" | "stale" | "failing" | "disabled" | "unknown"

export type SourceRegistryRecord = {
  id: string
  name: string
  domain: string
  url: string
  feedUrl?: string
  endpointUrl?: string
  sourceType: SourceType
  trustTier: SourceTrustTier
  countriesCovered: string[]
  languages: string[]
  topics: string[]
  ingestionMethod: IngestionMethod
  crawlFrequencyMinutes: number
  parserConfig?: Record<string, unknown>
  rateLimitPerMinute: number
  enabled: boolean
}

export type SourceHealth = SourceRegistryRecord & {
  lastSuccessfulFetch?: string
  lastAttemptAt?: string
  consecutiveFailures: number
  freshnessStatus: FreshnessStatus
  lastError?: string
  documentsFetched?: number
  duplicateRate?: number
}

export type EvidenceReference = {
  sourceId: string
  sourceName: string
  sourceUrl: string
  title: string
  publishedAt?: string
  evidenceText?: string
  trustTier: SourceTrustTier
}

export type IntelligenceEventType =
  | "payment_rail_launched"
  | "product_launched"
  | "pilot_announced"
  | "pilot_expanded"
  | "cross_border_corridor_announced"
  | "cross_border_corridor_live"
  | "corridor_delayed_or_terminated"
  | "merchant_acceptance_expanded"
  | "new_bank_or_psp_participant"
  | "partnership_announced"
  | "acquisition_or_investment"
  | "technical_integration"
  | "api_access_changed"
  | "licensing_rule_changed"
  | "new_licence_issued"
  | "regulatory_consultation"
  | "law_adopted"
  | "regulation_effective"
  | "payment_activity_restricted_or_banned"
  | "crypto_stablecoin_rule_changed"
  | "cbdc_development"
  | "settlement_or_fx_model_changed"
  | "fee_or_limit_changed"
  | "fraud_security_incident"
  | "outage"
  | "enforcement_action"
  | "other"

export type ReviewStatus = "auto_published" | "unconfirmed" | "needs_review" | "conflict" | "rejected"

export type IntelligenceEvent = {
  id: string
  eventType: IntelligenceEventType
  title: string
  summary: string
  eventDate?: string
  announcementDate?: string
  affectedCountries: string[]
  originCountry?: string
  destinationCountry?: string
  paymentRails: string[]
  companies: string[]
  regulators: string[]
  currencies: string[]
  qrMode: "CPM" | "MPM" | "both" | "not_stated" | "unknown"
  useCases: string[]
  corridorStatus?: InteroperabilityCorridor["status"]
  previousState?: string
  newState?: string
  commercialImpact: string
  recommendedBdAction: string
  unresolvedQuestions: string[]
  confidence: Confidence
  confidenceScore: number
  confidenceReasons: string[]
  reviewStatus: ReviewStatus
  evidence: EvidenceReference[]
  dashboardsUpdated?: string[]
  createdAt: string
}

export type CompanyProfile = {
  id: string
  name: string
  type: string
  markets: string[]
  rails: string[]
  relationships: string[]
  recentSignals: string[]
  confidence: Confidence
  lastVerified?: string
}

export type RegulatoryItem = {
  id: string
  country: string
  regulator: string
  topic: string
  status: string
  effectiveDate?: string
  summary: string
  impact: string
  confidence: Confidence
  sources: EvidenceReference[]
}

export type OpportunityCard = {
  id: string
  title: string
  market: string
  corridor?: string
  score: number
  components: Array<{ label: string; value: number; weight: number }>
  whyNow: string
  targetCounterparties: string[]
  commercialAngle: string
  blockers: string[]
  suggestedNextAction: string
  confidence: Confidence
  evidence: EvidenceReference[]
  owner?: string
  status: "new" | "triaged" | "in_progress" | "blocked" | "won" | "closed"
}

export type Watchlist = {
  id: string
  name: string
  description: string
  filters: {
    countries?: string[]
    rails?: string[]
    companies?: string[]
    corridors?: string[]
    eventTypes?: IntelligenceEventType[]
    keywords?: string[]
  }
  alertCount: number
  lastTriggeredAt?: string
}

export type GeneratedAlert = {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  body: string
  createdAt: string
  watchlistId?: string
  eventId?: string
  read: boolean
}

export type IngestionRunSummary = {
  id: string
  jobType: string
  status: "running" | "success" | "failed" | "partial"
  startedAt: string
  finishedAt?: string
  sourceId?: string
  documentsFetched: number
  documentsCreated: number
  duplicates: number
  eventsCreated: number
  errors: number
}

export type DashboardFreshness = {
  lastSuccessfulSync?: string
  lastIngestionRun?: string
  lastProjectionRebuild?: string
  sourceCount: number
  failingSources: number
  pendingReviews: number
  newDocuments24h: number
  eventsCreated24h: number
}

export type DashboardSnapshot = {
  dataMode: DataMode
  countries: CountryPaymentProfile[]
  news: NewsItem[]
  corridors: InteroperabilityCorridor[]
  events: IntelligenceEvent[]
  sources: SourceHealth[]
  ingestionRuns: IngestionRunSummary[]
  companies: CompanyProfile[]
  regulation: RegulatoryItem[]
  opportunities: OpportunityCard[]
  watchlists: Watchlist[]
  alerts: GeneratedAlert[]
  freshness: DashboardFreshness
}
