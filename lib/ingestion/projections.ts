import { sourceRegistry } from "@/lib/ingestion/sourceRegistry"
import {
  getLegacyAlerts,
  getLegacyCompanies,
  getLegacyCountries,
  getLegacyFreshness,
  getLegacyIngestionRuns,
  getLegacyOpportunities,
  getLegacyRegulation,
  getLegacyWatchlists,
} from "@/lib/intelligence/legacy"
import type { NormalizedDocument } from "@/lib/ingestion/sourceTypes"
import type { CountryPaymentProfile, InteroperabilityCorridor, NewsItem, Participant } from "@/lib/types"
import type { DashboardSnapshot, GeneratedAlert, IngestionRunSummary, IntelligenceEvent, SourceHealth } from "@/lib/intelligence/types"

export function buildSnapshotFromEvents({
  events,
  documents,
  run,
}: {
  events: IntelligenceEvent[]
  documents: NormalizedDocument[]
  run: IngestionRunSummary
}): Omit<DashboardSnapshot, "dataMode"> {
  const countries = getLegacyCountries().map((country) => clone(country))
  const corridors = countries.flatMap((country) => country.interoperability)
  const news = countries.flatMap((country) => country.news)
  const now = new Date().toISOString()

  events.forEach((event) => {
    applyEventToCountries(countries, event, now)
    news.unshift(eventToNews(event))
    if (event.corridorStatus && event.originCountry && event.destinationCountry) {
      upsertCorridor(corridors, event)
    }
  })

  const sources = buildSourceHealth(documents, run)
  const companies = getLegacyCompanies(countries)
  const regulation = getLegacyRegulation(countries)
  const opportunities = getLegacyOpportunities(countries).map((opportunity) => {
    const eventBoost = events.some((event) => event.affectedCountries.includes(opportunity.market.toLowerCase().replaceAll(" ", "-"))) ? 3 : 0
    return { ...opportunity, score: Math.min(100, opportunity.score + eventBoost) }
  })
  const watchlists = getLegacyWatchlists().map((watchlist) => {
    const alertCount = events.filter((event) => {
      const countriesMatch = watchlist.filters.countries?.some((country) => event.affectedCountries.includes(country)) ?? false
      const eventTypeMatch = watchlist.filters.eventTypes?.includes(event.eventType) ?? false
      const keywordMatch = watchlist.filters.keywords?.some((keyword) => event.title.toLowerCase().includes(keyword.toLowerCase())) ?? false
      return countriesMatch || eventTypeMatch || keywordMatch
    }).length
    return { ...watchlist, alertCount, lastTriggeredAt: alertCount ? now : watchlist.lastTriggeredAt }
  })
  const alerts = [...events.map(eventToAlert), ...getLegacyAlerts(events)].slice(0, 30)
  const freshness = {
    ...getLegacyFreshness(),
    lastSuccessfulSync: run.status === "success" || run.status === "partial" ? run.finishedAt : undefined,
    lastIngestionRun: run.startedAt,
    lastProjectionRebuild: now,
    sourceCount: sourceRegistry.length,
    failingSources: sources.filter((source) => source.freshnessStatus === "failing").length,
    pendingReviews: events.filter((event) => event.reviewStatus === "needs_review").length,
    newDocuments24h: documents.length,
    eventsCreated24h: events.length,
  }

  return {
    countries,
    news: news.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 200),
    corridors,
    events,
    sources,
    ingestionRuns: [run, ...getLegacyIngestionRuns()],
    companies,
    regulation,
    opportunities,
    watchlists,
    alerts,
    freshness,
  }
}

function applyEventToCountries(countries: CountryPaymentProfile[], event: IntelligenceEvent, now: string) {
  event.affectedCountries.forEach((slug) => {
    const country = countries.find((item) => item.slug === slug || item.countryName.toLowerCase() === slug.toLowerCase())
    if (!country) return
    country.news = [eventToNews(event), ...country.news].slice(0, 20)
    country.dataQuality = {
      ...country.dataQuality,
      lastUpdated: now.slice(0, 10),
      lastSourceCheck: now.slice(0, 10),
      numberOfSources: country.dataQuality.numberOfSources + event.evidence.length,
      confidenceByCategory: {
        ...country.dataQuality.confidenceByCategory,
        news: event.confidence,
        interoperability: event.eventType.includes("corridor") ? event.confidence : country.dataQuality.confidenceByCategory.interoperability,
        qrSystem: event.eventType.includes("rail") ? event.confidence : country.dataQuality.confidenceByCategory.qrSystem,
      },
      warnings: country.dataQuality.warnings.filter((warning) => !warning.includes("legacy_seed")),
    }

    event.companies.forEach((companyName, index) => {
      if (country.banksAndPsps.some((participant) => participant.name === companyName)) return
      const participant: Participant = {
        id: `${country.slug}-event-participant-${event.id}-${index}`,
        name: companyName,
        type: "psp",
        role: `Mentioned in ${event.eventType.replaceAll("_", " ")}`,
        accessRoute: "unknown",
        capabilities: event.paymentRails,
        confidence: event.confidence,
        lastVerified: now.slice(0, 10),
      }
      country.banksAndPsps.push(participant)
    })
  })
}

function upsertCorridor(corridors: InteroperabilityCorridor[], event: IntelligenceEvent) {
  const sourceCountry = event.originCountry ?? event.affectedCountries[0]
  const targetCountry = event.destinationCountry ?? event.affectedCountries[1]
  if (!sourceCountry || !targetCountry) return
  const existing = corridors.find((corridor) => corridor.sourceCountry.toLowerCase() === sourceCountry.toLowerCase() && corridor.targetCountry.toLowerCase() === targetCountry.toLowerCase())
  if (existing) {
    existing.status = event.corridorStatus ?? existing.status
    existing.confidence = event.confidence
    existing.sources = event.evidence.map((evidence) => evidence.sourceUrl)
    existing.pspRelevance = event.commercialImpact
    return
  }
  corridors.push({
    id: `corridor-${event.id}`,
    sourceCountry,
    targetCountry,
    sourceSystem: event.paymentRails[0],
    targetSystem: event.paymentRails[1],
    status: event.corridorStatus ?? "announced",
    networkOrOperator: event.companies[0],
    useCases: event.useCases,
    launchDate: event.eventDate,
    settlementNotes: "Extracted event did not state settlement model.",
    fxNotes: "Extracted event did not state FX model.",
    merchantAcceptanceNotes: "Requires validation from source evidence.",
    pspRelevance: event.commercialImpact,
    sources: event.evidence.map((evidence) => evidence.sourceUrl),
    confidence: event.confidence,
  })
}

function eventToNews(event: IntelligenceEvent): NewsItem {
  return {
    id: `news-${event.id}`,
    countrySlug: event.affectedCountries[0] ?? "global",
    title: event.title,
    summary: event.summary,
    date: (event.eventDate ?? event.announcementDate ?? event.createdAt).slice(0, 10),
    sourceName: event.evidence[0]?.sourceName ?? "Stored evidence",
    sourceUrl: event.evidence[0]?.sourceUrl,
    sourceType: event.evidence[0]?.trustTier === 1 ? "official" : "other",
    category: event.eventType.includes("regulat") || event.eventType.includes("licensing") ? "regulation" : event.eventType.includes("corridor") ? "interoperability" : "other",
    whyItMattersForPsps: event.commercialImpact,
    relatedCountries: event.affectedCountries,
    relatedSystems: event.paymentRails,
    confidence: event.confidence,
    parsedAt: event.createdAt,
  }
}

function eventToAlert(event: IntelligenceEvent) {
  const severity: GeneratedAlert["severity"] = event.eventType.includes("regulat") || event.eventType.includes("licensing") ? "high" : event.reviewStatus === "needs_review" ? "medium" : "low"
  return {
    id: `alert-${event.id}`,
    title: event.title,
    severity,
    body: event.recommendedBdAction,
    createdAt: event.createdAt,
    eventId: event.id,
    read: false,
  }
}

function buildSourceHealth(documents: NormalizedDocument[], run: IngestionRunSummary): SourceHealth[] {
  return sourceRegistry.map((source) => {
    const fetched = documents.filter((document) => document.sourceId === source.id).length
    return {
      ...source,
      lastSuccessfulFetch: fetched ? run.finishedAt : undefined,
      lastAttemptAt: run.finishedAt,
      consecutiveFailures: fetched ? 0 : 0,
      freshnessStatus: source.enabled ? (fetched ? "fresh" : "due") : "disabled",
      documentsFetched: fetched,
      duplicateRate: run.documentsFetched ? run.duplicates / run.documentsFetched : 0,
    }
  })
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
