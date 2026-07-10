import { unstable_noStore as noStore } from "next/cache"
import {
  getLegacyAlerts,
  getLegacyCompanies,
  getLegacyCorridors,
  getLegacyCountries,
  getLegacyEvents,
  getLegacyFreshness,
  getLegacyIngestionRuns,
  getLegacyNews,
  getLegacyOpportunities,
  getLegacyRegulation,
  getLegacySources,
  getLegacyWatchlists,
} from "@/lib/intelligence/legacy"
import { isSupabaseConfigured, supabaseSelect, supabaseUpsert } from "@/lib/intelligence/supabase-rest"
import type { CountryPaymentProfile, InteroperabilityCorridor, NewsItem } from "@/lib/types"
import type {
  CompanyProfile,
  DashboardFreshness,
  DashboardSnapshot,
  GeneratedAlert,
  IngestionRunSummary,
  IntelligenceEvent,
  OpportunityCard,
  RegulatoryItem,
  SourceHealth,
  Watchlist,
} from "@/lib/intelligence/types"

type ProjectionRow<T> = {
  projection_type: string
  projection_id: string
  payload: T
  updated_at?: string
}

function fallbackSnapshot(): DashboardSnapshot {
  const countries = getLegacyCountries()
  const events = getLegacyEvents()
  return {
    dataMode: "legacy_seed",
    countries,
    news: getLegacyNews(),
    corridors: getLegacyCorridors(),
    events,
    sources: getLegacySources(),
    ingestionRuns: getLegacyIngestionRuns(),
    companies: getLegacyCompanies(countries),
    regulation: getLegacyRegulation(countries),
    opportunities: getLegacyOpportunities(countries),
    watchlists: getLegacyWatchlists(),
    alerts: getLegacyAlerts(events),
    freshness: getLegacyFreshness(),
  }
}

async function readProjection<T>(projectionType: string) {
  const query = `projection_type=eq.${encodeURIComponent(projectionType)}&select=projection_id,payload,updated_at&order=updated_at.desc`
  return supabaseSelect<ProjectionRow<T>>("dashboard_projections", query)
}

function payloads<T>(rows: Array<ProjectionRow<T>>) {
  return rows.map((row) => row.payload)
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  noStore()
  if (!isSupabaseConfigured()) return fallbackSnapshot()

  try {
    const [
      countries,
      news,
      corridors,
      events,
      sources,
      ingestionRuns,
      companies,
      regulation,
      opportunities,
      watchlists,
      alerts,
      freshness,
    ] = await Promise.all([
      readProjection<CountryPaymentProfile>("country_profile"),
      readProjection<NewsItem>("news_item"),
      readProjection<InteroperabilityCorridor>("corridor"),
      readProjection<IntelligenceEvent>("intelligence_event"),
      readProjection<SourceHealth>("source_health"),
      readProjection<IngestionRunSummary>("ingestion_run"),
      readProjection<CompanyProfile>("company_profile"),
      readProjection<RegulatoryItem>("regulatory_item"),
      readProjection<OpportunityCard>("opportunity_card"),
      readProjection<Watchlist>("watchlist"),
      readProjection<GeneratedAlert>("alert"),
      readProjection<DashboardFreshness>("freshness"),
    ])

    const countryPayloads = payloads(countries)
    if (countryPayloads.length === 0) return fallbackSnapshot()

    return {
      dataMode: "database",
      countries: countryPayloads,
      news: payloads(news),
      corridors: payloads(corridors),
      events: payloads(events),
      sources: payloads(sources),
      ingestionRuns: payloads(ingestionRuns),
      companies: payloads(companies),
      regulation: payloads(regulation),
      opportunities: payloads(opportunities),
      watchlists: payloads(watchlists),
      alerts: payloads(alerts),
      freshness: payloads(freshness)[0] ?? {
        sourceCount: payloads(sources).length,
        failingSources: payloads(sources).filter((source) => source.freshnessStatus === "failing").length,
        pendingReviews: 0,
        newDocuments24h: 0,
        eventsCreated24h: 0,
      },
    }
  } catch (error) {
    console.error("Falling back to legacy seed after projection read failure", error)
    return fallbackSnapshot()
  }
}

export async function getCountries() {
  return (await getDashboardSnapshot()).countries
}

export async function getCountryBySlug(slug: string) {
  return (await getCountries()).find((country) => country.slug === slug)
}

export async function getCountrySlugs() {
  return getLegacyCountries().map((country) => country.slug)
}

export async function getNews() {
  return (await getDashboardSnapshot()).news
}

export async function getCorridors() {
  return (await getDashboardSnapshot()).corridors
}

export async function writeProjections(snapshot: Omit<DashboardSnapshot, "dataMode">) {
  if (!isSupabaseConfigured()) return { written: 0, skipped: true }
  const rows: Array<Record<string, unknown>> = [
    ...snapshot.countries.map((payload) => projection("country_profile", payload.slug, payload)),
    ...snapshot.news.map((payload) => projection("news_item", payload.id, payload)),
    ...snapshot.corridors.map((payload) => projection("corridor", payload.id, payload)),
    ...snapshot.events.map((payload) => projection("intelligence_event", payload.id, payload)),
    ...snapshot.sources.map((payload) => projection("source_health", payload.id, payload)),
    ...snapshot.ingestionRuns.map((payload) => projection("ingestion_run", payload.id, payload)),
    ...snapshot.companies.map((payload) => projection("company_profile", payload.id, payload)),
    ...snapshot.regulation.map((payload) => projection("regulatory_item", payload.id, payload)),
    ...snapshot.opportunities.map((payload) => projection("opportunity_card", payload.id, payload)),
    ...snapshot.watchlists.map((payload) => projection("watchlist", payload.id, payload)),
    ...snapshot.alerts.map((payload) => projection("alert", payload.id, payload)),
    projection("freshness", "global", snapshot.freshness),
  ]
  await supabaseUpsert("dashboard_projections", rows, "projection_type,projection_id")
  return { written: rows.length, skipped: false }
}

function projection<T>(projectionType: string, projectionId: string, payload: T) {
  return {
    projection_type: projectionType,
    projection_id: projectionId,
    payload,
    updated_at: new Date().toISOString(),
  }
}
