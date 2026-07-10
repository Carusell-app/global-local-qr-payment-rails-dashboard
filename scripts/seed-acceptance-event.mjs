const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and a publishable key are required")
  process.exit(1)
}

const now = new Date().toISOString()
const publishedAt = "2026-07-07T11:32:17+05:30"
const eventDate = "2026-07-07"
const canonicalUrl = "https://economictimes.indiatimes.com/nri/invest/indias-upi-to-link-with-indonesias-payment-system-says-pm-modi/articleshow/132231906.cms"
const mobileUrl = "https://m.economictimes.com/nri/invest/indias-upi-to-link-with-indonesias-payment-system-says-pm-modi/articleshow/132231906.cms"
const title = "India's UPI to link with Indonesia's payment system, says PM Modi"
const summary =
  "Prime Minister Narendra Modi said India's Unified Payments Interface is set to be integrated with Indonesia's payment system, with the stated aim of improving business and travel between the countries."
const evidenceText =
  "The article reports that India's UPI is set to be integrated with Indonesia's payment system and quotes the Prime Minister saying it will boost ease of doing business and travel."

const evidence = {
  sourceId: "economic-times-upi-indonesia-2026",
  sourceName: "The Economic Times",
  sourceUrl: canonicalUrl,
  title,
  publishedAt,
  evidenceText,
  trustTier: 3,
}

const event = {
  id: "event-upi-indonesia-integration-2026-07-07",
  eventType: "cross_border_corridor_announced",
  title,
  summary,
  eventDate,
  announcementDate: publishedAt,
  affectedCountries: ["india", "indonesia"],
  originCountry: "India",
  destinationCountry: "Indonesia",
  paymentRails: ["UPI", "Indonesia payment system / QRIS"],
  companies: ["National Payments Corporation of India"],
  regulators: ["Reserve Bank of India", "Bank Indonesia"],
  currencies: ["INR", "IDR"],
  qrMode: "not_stated",
  useCases: ["cross-border payments", "travel payments", "business payments"],
  corridorStatus: "announced",
  previousState: "No India-Indonesia UPI integration visible in the dashboard.",
  newState: "UPI-Indonesia payment-system integration announced and tracked as an announced corridor.",
  commercialImpact:
    "PSPs serving Indian travelers, Indonesian merchants or India-Indonesia business flows should monitor UPI acceptance, FX, settlement and acquiring-partner requirements before product planning.",
  recommendedBdAction:
    "Open discovery with NPCI International, Bank Indonesia-connected acquirers and Indonesian PSPs; verify launch timeline, QR acceptance model, settlement flow and sponsor requirements.",
  unresolvedQuestions: [
    "Which Indonesian payment system endpoint or QR standard will be used?",
    "What go-live date and participating banks or PSPs have been confirmed?",
    "What settlement and FX model will apply to merchant acceptance?",
  ],
  confidence: "medium",
  confidenceScore: 72,
  confidenceReasons: [
    "The publication date and canonical URL were extracted from article metadata.",
    "The source is a named business-news publisher and the article quotes the public announcement.",
    "Implementation details such as launch date, settlement and participants still require official NPCI or Bank Indonesia confirmation.",
  ],
  reviewStatus: "auto_published",
  evidence: [evidence],
  dashboardsUpdated: [
    "Live Intelligence",
    "News feed",
    "Country profiles",
    "Interoperability matrix",
    "Opportunities",
    "Data Operations",
  ],
  createdAt: now,
}

const newsItem = {
  id: "news-upi-indonesia-integration-2026-07-07",
  countrySlug: "india",
  title,
  summary,
  date: eventDate,
  sourceName: "The Economic Times",
  sourceUrl: canonicalUrl,
  sourceType: "fintech_media",
  category: "interoperability",
  whyItMattersForPsps: event.commercialImpact,
  relatedCountries: ["india", "indonesia"],
  relatedSystems: ["UPI", "Indonesia payment system / QRIS"],
  confidence: "medium",
  parsedAt: now,
}

const corridor = {
  id: "corridor-india-indonesia-upi-qris-2026",
  sourceCountry: "India",
  targetCountry: "Indonesia",
  sourceSystem: "UPI",
  targetSystem: "Indonesia payment system / QRIS",
  status: "announced",
  networkOrOperator: "NPCI International / Indonesian payment-system participants",
  useCases: ["travel", "merchant payments", "business payments"],
  launchDate: eventDate,
  settlementNotes: "Not stated in the source; requires official confirmation.",
  fxNotes: "Not stated in the source; requires official confirmation.",
  merchantAcceptanceNotes: "Integration announced; participating acquirers and merchant rollout not yet confirmed.",
  pspRelevance: event.commercialImpact,
  sources: [canonicalUrl],
  confidence: "medium",
}

const countries = [
  countryProfile({
    id: "india",
    slug: "india",
    name: "India",
    iso2: "IN",
    iso3: "IND",
    flag: "IN",
    region: "South Asia",
    currency: { name: "Indian rupee", code: "INR", symbol: "Rs" },
    system: "UPI",
    operator: "National Payments Corporation of India",
    regulator: "Reserve Bank of India",
    coordinates: { lat: 20.5937, lng: 78.9629 },
    news: [newsItem],
    interoperability: [corridor],
  }),
  countryProfile({
    id: "indonesia",
    slug: "indonesia",
    name: "Indonesia",
    iso2: "ID",
    iso3: "IDN",
    flag: "ID",
    region: "Southeast Asia",
    currency: { name: "Indonesian rupiah", code: "IDR", symbol: "Rp" },
    system: "QRIS",
    operator: "Bank Indonesia / Indonesian payment-system participants",
    regulator: "Bank Indonesia",
    coordinates: { lat: -0.7893, lng: 113.9213 },
    news: [newsItem],
    interoperability: [{ ...corridor, sourceCountry: "Indonesia", targetCountry: "India", sourceSystem: "Indonesia payment system / QRIS", targetSystem: "UPI" }],
  }),
]

const run = {
  id: "run-acceptance-upi-indonesia-2026-07-07",
  jobType: "acceptance_ingest",
  status: "success",
  startedAt: now,
  finishedAt: now,
  documentsFetched: 1,
  documentsCreated: 1,
  duplicates: 0,
  eventsCreated: 1,
  errors: 0,
}

const sources = [
  {
    id: "economic-times-upi-indonesia-2026",
    name: "The Economic Times",
    domain: "economictimes.indiatimes.com",
    url: "https://economictimes.indiatimes.com/",
    sourceType: "industry_media",
    trustTier: 3,
    countriesCovered: ["india", "indonesia"],
    languages: ["en"],
    topics: ["cross_border", "upi", "payment_systems"],
    ingestionMethod: "manual",
    crawlFrequencyMinutes: 1440,
    rateLimitPerMinute: 2,
    enabled: true,
    lastSuccessfulFetch: now,
    consecutiveFailures: 0,
    freshnessStatus: "fresh",
    documentsFetched: 1,
    duplicateRate: 0,
  },
]

const companies = [
  {
    id: "national-payments-corporation-of-india",
    name: "National Payments Corporation of India",
    type: "scheme",
    markets: ["India", "Indonesia"],
    rails: ["UPI", "Indonesia payment system / QRIS"],
    relationships: ["UPI operator; cross-border integration counterparty to be confirmed"],
    recentSignals: [title],
    confidence: "medium",
    lastVerified: eventDate,
  },
]

const regulation = [
  {
    id: "india-indonesia-upi-integration-regulatory-watch",
    country: "India / Indonesia",
    regulator: "Reserve Bank of India; Bank Indonesia",
    topic: "Cross-border payment-system integration",
    status: "announced",
    effectiveDate: eventDate,
    summary,
    impact: event.commercialImpact,
    confidence: "medium",
    sources: [evidence],
  },
]

const opportunities = [
  {
    id: "opportunity-india-indonesia-upi-corridor",
    title: "India-Indonesia UPI corridor discovery",
    market: "India / Indonesia",
    corridor: "India to Indonesia",
    score: 78,
    components: [
      { label: "Rail maturity", value: 86, weight: 0.22 },
      { label: "Cross-border readiness", value: 72, weight: 0.22 },
      { label: "Merchant coverage", value: 68, weight: 0.16 },
      { label: "Regulatory clarity", value: 58, weight: 0.16 },
      { label: "Partner availability", value: 74, weight: 0.14 },
      { label: "Evidence confidence", value: 72, weight: 0.1 },
    ],
    whyNow: "A post-May-2026 publication reports an announced UPI integration with Indonesia's payment system.",
    targetCounterparties: ["NPCI International", "Bank Indonesia-connected acquirers", "Indonesian PSPs"],
    commercialAngle: "Travel and merchant acceptance products could benefit if the announced integration becomes live.",
    blockers: event.unresolvedQuestions,
    suggestedNextAction: event.recommendedBdAction,
    confidence: "medium",
    evidence: [evidence],
    status: "new",
  },
]

const watchlists = [
  {
    id: "watchlist-india-indonesia-upi",
    name: "India-Indonesia UPI integration",
    description: "Tracks go-live, participant, settlement and QR acceptance updates for the announced India-Indonesia payment-system integration.",
    filters: { countries: ["india", "indonesia"], rails: ["UPI", "QRIS"], eventTypes: ["cross_border_corridor_announced"] },
    alertCount: 1,
    lastTriggeredAt: now,
  },
]

const alerts = [
  {
    id: "alert-upi-indonesia-integration-2026-07-07",
    title,
    severity: "medium",
    body: event.recommendedBdAction,
    createdAt: now,
    watchlistId: "watchlist-india-indonesia-upi",
    eventId: event.id,
    read: false,
  },
]

const freshness = {
  lastSuccessfulSync: now,
  lastIngestionRun: now,
  lastProjectionRebuild: now,
  sourceCount: sources.length,
  failingSources: 0,
  pendingReviews: 0,
  newDocuments24h: 1,
  eventsCreated24h: 1,
}

await upsert("source_registry", [
  {
    id: sources[0].id,
    canonical_name: sources[0].name,
    aliases: [],
    domain: sources[0].domain,
    source_type: sources[0].sourceType,
    trust_tier: sources[0].trustTier,
    countries_covered: sources[0].countriesCovered,
    languages: sources[0].languages,
    topics: sources[0].topics,
    ingestion_method: sources[0].ingestionMethod,
    feed_url: null,
    endpoint_url: sources[0].url,
    crawl_frequency_minutes: sources[0].crawlFrequencyMinutes,
    parser_config: {},
    rate_limit_per_minute: sources[0].rateLimitPerMinute,
    enabled: true,
    last_successful_fetch: now,
    consecutive_failures: 0,
    freshness_status: "fresh",
    provenance: { canonical_url: canonicalUrl },
    confidence: 0.72,
    last_verified_at: now,
    review_status: "approved",
  },
], "id")

await upsert("ingestion_runs", [
  {
    id: run.id,
    job_type: run.jobType,
    status: run.status,
    source_id: sources[0].id,
    started_at: run.startedAt,
    finished_at: run.finishedAt,
    documents_fetched: 1,
    documents_created: 1,
    duplicates: 0,
    events_created: 1,
    errors: 0,
    metadata: { acceptance_test: true, source_url: canonicalUrl },
  },
], "id")

await upsert("raw_documents", [
  {
    id: "raw-upi-indonesia-2026-07-07",
    source_id: sources[0].id,
    canonical_url: canonicalUrl,
    normalized_url: canonicalUrl,
    title,
    publisher: "The Economic Times",
    author: "ET Online",
    publication_timestamp: publishedAt,
    update_timestamp: "2026-07-07T18:34:50+05:30",
    event_date: eventDate,
    language: "en",
    clean_text: `${summary}\n\n${evidenceText}`,
    excerpt: summary,
    source_type: "industry_media",
    original_country: "india",
    content_hash: "acceptance-upi-indonesia-2026-07-07",
    raw_snapshot: evidenceText,
    provenance: { canonical_url: canonicalUrl, fetched_url: mobileUrl },
    confidence: 0.72,
    last_verified_at: now,
    review_status: "approved",
  },
], "id")

await upsert("normalized_documents", [
  {
    id: "norm-upi-indonesia-2026-07-07",
    raw_document_id: "raw-upi-indonesia-2026-07-07",
    document_type: "news_article",
    canonical_url: canonicalUrl,
    title,
    publication_timestamp: publishedAt,
    affected_countries: ["india", "indonesia"],
    payment_rails: ["UPI", "QRIS"],
    companies: ["National Payments Corporation of India"],
    regulators: ["Reserve Bank of India", "Bank Indonesia"],
    currencies: ["INR", "IDR"],
    topics: ["cross_border", "payment_system_integration", "upi"],
    clean_text: `${summary}\n\n${evidenceText}`,
    excerpt: summary,
    content_hash: "acceptance-upi-indonesia-normalized-2026-07-07",
    provenance: { canonical_url: canonicalUrl },
    confidence: 0.72,
    last_verified_at: now,
    review_status: "approved",
  },
], "id")

await upsert("story_clusters", [
  {
    id: "story-upi-indonesia-integration-2026-07-07",
    canonical_name: title,
    aliases: ["India Indonesia UPI integration", "UPI Indonesia payment system"],
    primary_document_id: "norm-upi-indonesia-2026-07-07",
    canonical_url: canonicalUrl,
    earliest_publication_at: publishedAt,
    authoritative_source_id: sources[0].id,
    document_ids: ["norm-upi-indonesia-2026-07-07"],
    supporting_sources: [evidence],
    conflicting_claims: [],
    provenance: { canonical_url: canonicalUrl },
    confidence: 0.72,
    last_verified_at: now,
    review_status: "approved",
  },
], "id")

await upsert("news_items", [
  {
    id: newsItem.id,
    story_cluster_id: "story-upi-indonesia-integration-2026-07-07",
    canonical_name: newsItem.title,
    canonical_url: canonicalUrl,
    summary: newsItem.summary,
    publisher: newsItem.sourceName,
    publication_timestamp: publishedAt,
    event_date: eventDate,
    affected_countries: newsItem.relatedCountries,
    payment_rails: newsItem.relatedSystems,
    companies: event.companies,
    event_type: event.eventType,
    business_impact: event.commercialImpact,
    recommended_bd_action: event.recommendedBdAction,
    provenance: { canonical_url: canonicalUrl },
    confidence: 0.72,
    last_verified_at: now,
    review_status: "approved",
  },
], "id")

await upsert("countries", countries.map((country) => ({
  id: country.id,
  canonical_name: country.countryName,
  aliases: [country.slug],
  iso2: country.iso2,
  iso3: country.iso3,
  coordinates: country.coordinates,
  provenance: { updated_by_event: event.id },
  confidence: 0.72,
  last_verified_at: now,
  review_status: "approved",
})), "id")

await upsert("payment_rails", [
  rail("upi", "UPI", "india", "National Payments Corporation of India", "Reserve Bank of India"),
  rail("qris", "QRIS / Indonesia payment system", "indonesia", "Bank Indonesia / payment-system participants", "Bank Indonesia"),
], "id")

await upsert("corridors", [
  {
    id: corridor.id,
    canonical_name: "India to Indonesia UPI payment-system integration",
    aliases: ["UPI Indonesia corridor"],
    origin_country_id: "india",
    destination_country_id: "indonesia",
    status: "announced",
    directionality: "unknown",
    rails: ["UPI", "QRIS"],
    operators: ["National Payments Corporation of India", "Bank Indonesia"],
    use_cases: corridor.useCases,
    qr_modes: [],
    settlement_model: "not stated",
    fx_model: "not stated",
    launch_date: eventDate,
    effective_date: eventDate,
    provenance: { canonical_url: canonicalUrl, event_id: event.id },
    confidence: 0.72,
    last_verified_at: now,
    review_status: "approved",
  },
], "id")

await upsert("intelligence_events", [
  {
    id: event.id,
    canonical_name: event.title,
    aliases: ["India Indonesia UPI integration", "UPI Indonesia payment system"],
    event_type: event.eventType,
    summary: event.summary,
    announcement_date: event.announcementDate,
    event_date: event.eventDate,
    affected_countries: event.affectedCountries,
    origin_country: event.originCountry,
    destination_country: event.destinationCountry,
    payment_rails: event.paymentRails,
    companies: event.companies,
    regulators: event.regulators,
    currencies: event.currencies,
    qr_mode: event.qrMode,
    use_cases: event.useCases,
    previous_state: event.previousState,
    new_state: event.newState,
    commercial_impact: event.commercialImpact,
    recommended_bd_action: event.recommendedBdAction,
    unresolved_questions: event.unresolvedQuestions,
    provenance: { canonical_url: canonicalUrl, dashboards_updated: event.dashboardsUpdated },
    confidence: 0.72,
    confidence_reasons: event.confidenceReasons,
    last_verified_at: now,
    review_status: "approved",
  },
], "id")

await upsert("event_evidence", [
  {
    id: "evidence-upi-indonesia-2026-07-07",
    event_id: event.id,
    source_id: sources[0].id,
    source_url: canonicalUrl,
    title,
    evidence_text: evidenceText,
    published_at: publishedAt,
    trust_tier: 3,
  },
], "id")

const projections = [
  ...countries.map((payload) => projection("country_profile", payload.slug, payload)),
  projection("news_item", newsItem.id, newsItem),
  projection("corridor", corridor.id, corridor),
  projection("intelligence_event", event.id, event),
  ...sources.map((payload) => projection("source_health", payload.id, payload)),
  projection("ingestion_run", run.id, run),
  ...companies.map((payload) => projection("company_profile", payload.id, payload)),
  ...regulation.map((payload) => projection("regulatory_item", payload.id, payload)),
  ...opportunities.map((payload) => projection("opportunity_card", payload.id, payload)),
  ...watchlists.map((payload) => projection("watchlist", payload.id, payload)),
  ...alerts.map((payload) => projection("alert", payload.id, payload)),
  projection("freshness", "global", freshness),
]

await deleteRows("dashboard_projections")
await upsert("dashboard_projections", projections, "projection_type,projection_id")

console.log(JSON.stringify({
  source: canonicalUrl,
  publishedAt,
  eventId: event.id,
  projections: projections.length,
  dashboardsUpdated: event.dashboardsUpdated,
}, null, 2))

function countryProfile({ id, slug, name, iso2, iso3, flag, region, currency, system, operator, regulator, coordinates, news, interoperability }) {
  return {
    id,
    slug,
    countryName: name,
    iso2,
    iso3,
    flagEmoji: flag,
    region,
    coordinates,
    currency: { ...currency, settlementNotes: "Settlement model for the announced India-Indonesia integration is not stated in the source." },
    localSystems: [
      {
        id: `${slug}-primary-rail`,
        name: system,
        type: ["instant_payment", "national_qr"],
        operator,
        regulator,
        status: "active",
        qrStandard: "unknown",
        qrModes: ["MPM"],
        useCases: ["retail payments", "person-to-person payments", "cross-border payments"],
        accessModel: "Requires confirmation from operator or regulator.",
        settlementModel: "Not stated in the source.",
        documentationUrls: [canonicalUrl],
        notes: `Updated from a real ${eventDate} publication tracking the announced India-Indonesia payment-system integration.`,
        confidence: "medium",
      },
    ],
    cryptoRegulation: {
      legalStatus: "regulated",
      cryptoPaymentsAllowed: "unclear",
      exchangesAllowed: "licensed_only",
      stablecoinStatus: "unclear",
      cbdcStatus: "unknown",
      regulator,
      riskSummary: "Crypto payment treatment is outside the cited event and requires separate regulatory review.",
      lastUpdated: eventDate,
      confidence: "medium",
      sources: [canonicalUrl],
    },
    banksAndPsps: [
      {
        id: `${slug}-operator`,
        name: operator,
        type: slug === "india" ? "scheme" : "regulator",
        role: "Relevant payment-system operator or regulator for the announced integration.",
        accessRoute: "local_license_required",
        capabilities: [system],
        confidence: "medium",
        lastVerified: eventDate,
      },
    ],
    merchantCoverage: {
      level: "unknown",
      merchantCategories: ["travel", "retail POS", "business payments"],
      qrTypes: ["unknown"],
      onlineAcceptance: "unknown",
      offlineAcceptance: "unknown",
      notes: "Merchant rollout was not stated in the publication.",
      confidence: "medium",
    },
    interoperability,
    news,
    sources: [
      {
        id: "economic-times-upi-indonesia-2026",
        title,
        url: canonicalUrl,
        sourceType: "fintech_media",
        reliability: "medium",
        lastChecked: eventDate,
        notes: "Canonical source for the accepted real event.",
      },
    ],
    pspOpportunity: {
      opportunityScore: 78,
      marketAttractiveness: 80,
      accessDifficulty: 62,
      regulatoryComplexity: 58,
      crossBorderPotential: 84,
      merchantReadiness: 60,
      consumerAdoptionSignal: 76,
      cryptoCompatibility: 30,
      suggestedRouteToMarket: event.recommendedBdAction,
      keyOpenQuestions: event.unresolvedQuestions,
    },
    dataQuality: {
      lastUpdated: eventDate,
      lastSourceCheck: eventDate,
      numberOfSources: 1,
      confidenceByCategory: {
        qrSystem: "medium",
        banksPsps: "medium",
        interoperability: "medium",
        merchantCoverage: "low",
        cryptoRegulation: "low",
        news: "medium",
      },
      warnings: ["Launch timing, participants, settlement and FX model require official confirmation."],
    },
  }
}

function rail(id, canonicalName, countryId, operatorName, regulatorName) {
  return {
    id,
    canonical_name: canonicalName,
    aliases: [canonicalName],
    country_id: countryId,
    rail_type: ["instant_payment", "national_qr"],
    operator_name: operatorName,
    regulator_name: regulatorName,
    status: "active",
    qr_standard: "unknown",
    qr_modes: [],
    use_cases: ["retail payments", "cross-border payments"],
    provenance: { updated_by_event: event.id },
    confidence: 0.72,
    last_verified_at: now,
    review_status: "approved",
  }
}

function projection(projectionType, projectionId, payload) {
  return { projection_type: projectionType, projection_id: projectionId, payload, updated_at: now }
}

async function upsert(table, rows, onConflict) {
  const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : ""
  const response = await fetch(`${url}/rest/v1/${table}${query}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  })
  if (!response.ok) {
    throw new Error(`${table} upsert failed: ${response.status} ${await response.text()}`)
  }
}

async function deleteRows(table) {
  const response = await fetch(`${url}/rest/v1/${table}?projection_type=neq.__never__`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal",
    },
  })
  if (!response.ok) {
    throw new Error(`${table} delete failed: ${response.status} ${await response.text()}`)
  }
}
