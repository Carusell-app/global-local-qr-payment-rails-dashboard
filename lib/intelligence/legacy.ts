import { countries as seedCountries, getAllCorridors, getAllNews } from "@/lib/data/countries"
import { sourceRegistry } from "@/lib/ingestion/sourceRegistry"
import type { CountryPaymentProfile, NewsItem, SourceReference } from "@/lib/types"
import type {
  CompanyProfile,
  DashboardFreshness,
  GeneratedAlert,
  IngestionRunSummary,
  IntelligenceEvent,
  OpportunityCard,
  RegulatoryItem,
  SourceHealth,
  Watchlist,
} from "@/lib/intelligence/types"

const legacyDate = "2026-05-04"

function cleanSeedText(value?: string) {
  return (value ?? "")
    .replaceAll("Seed/mock profile for product architecture. Treat figures, participants and regulatory notes as directional and verify against official sources before use.", "Legacy seed profile. Verify against linked primary sources before use.")
    .replaceAll("Seed update", "Legacy seed signal")
    .replaceAll("Seed market", "Legacy market")
    .replaceAll("Seed regulatory", "Legacy regulatory")
    .replaceAll("Mock Daily Parser", "Legacy seed dataset")
    .replaceAll("Mock Merchant Monitor", "Legacy seed dataset")
    .replaceAll("Mock Regulatory Watch", "Legacy seed dataset")
    .replaceAll("Mock Corridor Desk", "Legacy seed dataset")
    .replaceAll("Mock System Monitor", "Legacy seed dataset")
    .replaceAll("Mock Access Desk", "Legacy seed dataset")
    .replaceAll("Mock Europe Desk", "Legacy seed dataset")
}

function legacySources(country: CountryPaymentProfile): SourceReference[] {
  return [
    {
      id: `${country.slug}-legacy-seed-provenance`,
      title: "Legacy seed dataset",
      url: "",
      sourceType: "other",
      reliability: "low",
      lastChecked: legacyDate,
      notes: "This record is a legacy seed fallback. Configure Supabase and run ingestion to attach primary-source evidence.",
    },
  ]
}

export function getLegacyCountries(): CountryPaymentProfile[] {
  return seedCountries.map((country) => ({
    ...country,
    localSystems: country.localSystems.map((system) => ({
      ...system,
      documentationUrls: [],
      notes: cleanSeedText(system.notes),
    })),
    cryptoRegulation: {
      ...country.cryptoRegulation,
      riskSummary: cleanSeedText(country.cryptoRegulation.riskSummary),
      sources: [],
    },
    banksAndPsps: country.banksAndPsps.map((participant) => ({ ...participant, website: participant.website?.startsWith("http") ? participant.website : undefined })),
    merchantCoverage: {
      ...country.merchantCoverage,
      notes: cleanSeedText(country.merchantCoverage.notes),
    },
    interoperability: country.interoperability.map((corridor) => ({
      ...corridor,
      sources: [],
      pspRelevance: cleanSeedText(corridor.pspRelevance),
    })),
    news: country.news.map((item) => sanitizeLegacyNews(item)),
    sources: legacySources(country),
    dataQuality: {
      ...country.dataQuality,
      warnings: [
        "legacy_seed fallback: Supabase is not configured or no verified projections are available.",
        "Use Data Operations to run ingestion before relying on this market for commercial decisions.",
      ],
      confidenceByCategory: {
        qrSystem: "low",
        banksPsps: "low",
        interoperability: "low",
        merchantCoverage: "low",
        cryptoRegulation: "low",
        news: "low",
      },
    },
  }))
}

function sanitizeLegacyNews(item: NewsItem): NewsItem {
  return {
    ...item,
    title: cleanSeedText(item.title),
    summary: cleanSeedText(item.summary),
    sourceName: "Legacy seed dataset",
    sourceUrl: undefined,
    sourceType: "other",
    whyItMattersForPsps: cleanSeedText(item.whyItMattersForPsps),
    confidence: "low",
  }
}

export function getLegacyNews() {
  return getAllNews().map((item) => sanitizeLegacyNews(item)).sort((a, b) => b.date.localeCompare(a.date))
}

export function getLegacyCorridors() {
  return getAllCorridors().map((corridor) => ({ ...corridor, sources: [] }))
}

export function getLegacySources(): SourceHealth[] {
  return sourceRegistry.map((source) => ({
    ...source,
    consecutiveFailures: 0,
    freshnessStatus: "unknown",
    documentsFetched: 0,
    duplicateRate: 0,
  }))
}

export function getLegacyEvents(): IntelligenceEvent[] {
  return getLegacyNews().slice(0, 12).map((item) => ({
    id: `legacy-event-${item.id}`,
    eventType: item.category === "interoperability" ? "cross_border_corridor_announced" : item.category === "regulation" ? "regulatory_consultation" : "other",
    title: item.title,
    summary: item.summary,
    announcementDate: item.date,
    affectedCountries: [item.countrySlug],
    paymentRails: item.relatedSystems ?? [],
    companies: [],
    regulators: [],
    currencies: [],
    qrMode: "not_stated",
    useCases: [],
    commercialImpact: item.whyItMattersForPsps,
    recommendedBdAction: "Verify the underlying source, then promote or reject the legacy signal from the review queue.",
    unresolvedQuestions: ["Which primary source confirms this signal?", "Did the status materially change or is this background context?"],
    confidence: "low",
    confidenceScore: 25,
    confidenceReasons: ["Legacy seed fallback has no primary-source evidence attached."],
    reviewStatus: "needs_review",
    evidence: [],
    createdAt: `${item.date}T00:00:00.000Z`,
  }))
}

export function getLegacyCompanies(countries = getLegacyCountries()): CompanyProfile[] {
  const byName = new Map<string, CompanyProfile>()
  countries.forEach((country) => {
    country.banksAndPsps.forEach((participant) => {
      const existing = byName.get(participant.name)
      const profile: CompanyProfile = existing ?? {
        id: participant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name: participant.name,
        type: participant.type,
        markets: [],
        rails: [],
        relationships: [],
        recentSignals: [],
        confidence: participant.confidence,
        lastVerified: participant.lastVerified,
      }
      profile.markets = Array.from(new Set([...profile.markets, country.countryName]))
      profile.rails = Array.from(new Set([...profile.rails, ...country.localSystems.map((system) => system.name)]))
      profile.relationships = Array.from(new Set([...profile.relationships, participant.role]))
      profile.recentSignals = Array.from(new Set([...profile.recentSignals, `${country.countryName}: ${participant.accessRoute ?? "unknown access"}`]))
      byName.set(participant.name, profile)
    })
  })
  return Array.from(byName.values()).sort((a, b) => b.markets.length - a.markets.length).slice(0, 40)
}

export function getLegacyRegulation(countries = getLegacyCountries()): RegulatoryItem[] {
  return countries.map((country) => ({
    id: `${country.slug}-regulatory-profile`,
    country: country.countryName,
    regulator: country.cryptoRegulation.regulator ?? country.localSystems[0]?.regulator ?? "Regulator not stated",
    topic: "Payment and digital asset perimeter",
    status: country.cryptoRegulation.legalStatus,
    effectiveDate: country.cryptoRegulation.lastUpdated,
    summary: cleanSeedText(country.cryptoRegulation.riskSummary),
    impact: `PSP route-to-market depends on ${country.banksAndPsps[0]?.accessRoute ?? "verified local partner"} and local licensing review.`,
    confidence: "low",
    sources: [],
  }))
}

export function getLegacyOpportunities(countries = getLegacyCountries()): OpportunityCard[] {
  return countries
    .map((country) => {
      const score = country.pspOpportunity
      return {
        id: `${country.slug}-opportunity`,
        title: `${country.countryName} PSP market entry`,
        market: country.countryName,
        score: score.opportunityScore,
        components: [
          { label: "Rail maturity", value: score.marketAttractiveness, weight: 0.2 },
          { label: "Merchant coverage", value: score.merchantReadiness, weight: 0.16 },
          { label: "Cross-border readiness", value: score.crossBorderPotential, weight: 0.16 },
          { label: "Regulatory openness", value: 100 - score.regulatoryComplexity, weight: 0.16 },
          { label: "Partner availability", value: 100 - score.accessDifficulty, weight: 0.14 },
          { label: "Consumer adoption", value: score.consumerAdoptionSignal, weight: 0.12 },
          { label: "Crypto compatibility", value: score.cryptoCompatibility, weight: 0.06 },
        ],
        whyNow: `${country.localSystems[0]?.name ?? "Local rail"} and ${country.interoperability.length} tracked corridor signal(s) make this worth monitoring.`,
        targetCounterparties: country.banksAndPsps.slice(0, 4).map((participant) => participant.name),
        commercialAngle: score.suggestedRouteToMarket ?? "Confirm local access route with banks, PSPs and regulators.",
        blockers: score.keyOpenQuestions,
        suggestedNextAction: "Attach primary-source evidence, validate access route, then assign an owner.",
        confidence: "low" as const,
        evidence: [],
        status: "new" as const,
      }
    })
    .sort((a, b) => b.score - a.score)
}

export function getLegacyWatchlists(): Watchlist[] {
  return [
    {
      id: "watchlist-asean-qr",
      name: "ASEAN QR interoperability",
      description: "Corridor launches, expansions and settlement model changes across Southeast Asian QR systems.",
      filters: { countries: ["indonesia", "malaysia", "singapore", "thailand", "vietnam", "philippines"], eventTypes: ["cross_border_corridor_live", "cross_border_corridor_announced"] },
      alertCount: 0,
    },
    {
      id: "watchlist-psp-access",
      name: "Foreign PSP access changes",
      description: "Licensing, API access, sponsor-bank and acquirer-route changes that affect market entry.",
      filters: { eventTypes: ["licensing_rule_changed", "api_access_changed", "new_bank_or_psp_participant"] },
      alertCount: 0,
    },
  ]
}

export function getLegacyAlerts(events = getLegacyEvents()): GeneratedAlert[] {
  return events.slice(0, 4).map((event) => ({
    id: `legacy-alert-${event.id}`,
    title: event.title,
    severity: event.eventType.includes("regulat") ? "high" : "medium",
    body: event.commercialImpact,
    createdAt: event.createdAt,
    eventId: event.id,
    read: false,
  }))
}

export function getLegacyIngestionRuns(): IngestionRunSummary[] {
  return [
    {
      id: "legacy-seed-mode",
      jobType: "legacy_seed",
      status: "partial",
      startedAt: `${legacyDate}T00:00:00.000Z`,
      finishedAt: `${legacyDate}T00:00:01.000Z`,
      documentsFetched: 0,
      documentsCreated: 0,
      duplicates: 0,
      eventsCreated: 0,
      errors: 0,
    },
  ]
}

export function getLegacyFreshness(): DashboardFreshness {
  return {
    lastSuccessfulSync: undefined,
    lastIngestionRun: legacyDate,
    lastProjectionRebuild: legacyDate,
    sourceCount: sourceRegistry.length,
    failingSources: 0,
    pendingReviews: getLegacyEvents().length,
    newDocuments24h: 0,
    eventsCreated24h: 0,
  }
}
