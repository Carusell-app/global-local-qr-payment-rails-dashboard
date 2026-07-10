import { clusterDocuments } from "@/lib/ingestion/deduplication"
import { extractEventsFromClusters } from "@/lib/ingestion/extraction"
import { fetchSource } from "@/lib/ingestion/fetchers"
import { normalizeDocument } from "@/lib/ingestion/normalizers"
import { parseFeedOrArticle } from "@/lib/ingestion/parsers"
import { buildSnapshotFromEvents } from "@/lib/ingestion/projections"
import { getSeedSourceById, getSeedSourcesForCadence } from "@/lib/ingestion/sourceRegistry"
import type { IngestionPipelineResult, NormalizedDocument, SourceRegistryRecord } from "@/lib/ingestion/sourceTypes"
import { writeProjections } from "@/lib/intelligence/repository"
import { isSupabaseConfigured, supabaseInsert, supabaseUpsert } from "@/lib/intelligence/supabase-rest"
import type { IngestionRunSummary } from "@/lib/intelligence/types"

export async function runIngestion(options: { sourceId?: string; cadence?: "priority" | "general" | "discovery" | "all"; backfillDays?: number } = {}): Promise<IngestionPipelineResult> {
  const startedAt = new Date().toISOString()
  const runId = `run_${startedAt.replace(/[^0-9]/g, "")}_${Math.random().toString(16).slice(2, 8)}`
  const sources = selectSources(options)
  const errors: Array<{ sourceId: string; message: string; url?: string }> = []
  const documents: NormalizedDocument[] = []

  for (const source of sources) {
    try {
      const fetched = await fetchSource(source)
      const parsed = await parseFeedOrArticle(source, fetched.body, fetched.contentType)
      errors.push(...parsed.errors)
      documents.push(...parsed.documents.map((document) => normalizeDocument(document, source)))
    } catch (error) {
      errors.push({ sourceId: source.id, message: error instanceof Error ? error.message : "Unknown fetch error", url: source.url })
    }
  }

  const uniqueDocuments = dedupeById(documents)
  const duplicateCount = documents.length - uniqueDocuments.length
  const clusters = clusterDocuments(uniqueDocuments)
  const events = await extractEventsFromClusters(clusters, uniqueDocuments)
  const finishedAt = new Date().toISOString()
  const run: IngestionRunSummary = {
    id: runId,
    jobType: options.backfillDays ? "backfill" : options.cadence ?? "general",
    status: errors.length && uniqueDocuments.length ? "partial" : errors.length ? "failed" : "success",
    startedAt,
    finishedAt,
    sourceId: options.sourceId,
    documentsFetched: documents.length,
    documentsCreated: uniqueDocuments.length,
    duplicates: duplicateCount,
    eventsCreated: events.length,
    errors: errors.length,
  }

  if (isSupabaseConfigured()) {
    await persistCanonicalData({ sources, documents: uniqueDocuments, clusters, events, run, errors })
  }
  const snapshot = buildSnapshotFromEvents({ events, documents: uniqueDocuments, run })
  await writeProjections(snapshot)

  return {
    runId,
    sourceIds: sources.map((source) => source.id),
    fetched: documents.length,
    created: uniqueDocuments.length,
    duplicates: duplicateCount,
    clusters: clusters.length,
    events: events.length,
    errors: errors.length,
    startedAt,
    finishedAt,
  }
}

export async function rebuildProjectionsOnly() {
  const now = new Date().toISOString()
  const run: IngestionRunSummary = {
    id: `projection_${now.replace(/[^0-9]/g, "")}`,
    jobType: "projection_rebuild",
    status: "success",
    startedAt: now,
    finishedAt: now,
    documentsFetched: 0,
    documentsCreated: 0,
    duplicates: 0,
    eventsCreated: 0,
    errors: 0,
  }
  const snapshot = buildSnapshotFromEvents({ events: [], documents: [], run })
  return writeProjections(snapshot)
}

function selectSources(options: { sourceId?: string; cadence?: "priority" | "general" | "discovery" | "all" }) {
  if (options.sourceId) {
    const source = getSeedSourceById(options.sourceId)
    return source ? [source] : []
  }
  return getSeedSourcesForCadence(options.cadence ?? "general")
}

function dedupeById(documents: NormalizedDocument[]) {
  return Array.from(new Map(documents.map((document) => [document.id, document])).values())
}

async function persistCanonicalData({
  sources,
  documents,
  clusters,
  events,
  run,
  errors,
}: {
  sources: SourceRegistryRecord[]
  documents: NormalizedDocument[]
  clusters: ReturnType<typeof clusterDocuments>
  events: Awaited<ReturnType<typeof extractEventsFromClusters>>
  run: IngestionRunSummary
  errors: Array<{ sourceId: string; message: string; url?: string }>
}) {
  await supabaseUpsert(
    "source_registry",
    sources.map((source) => ({
      id: source.id,
      canonical_name: source.name,
      domain: source.domain,
      source_type: source.sourceType,
      trust_tier: source.trustTier,
      countries_covered: source.countriesCovered,
      languages: source.languages,
      topics: source.topics,
      ingestion_method: source.ingestionMethod,
      feed_url: source.feedUrl,
      endpoint_url: source.endpointUrl,
      crawl_frequency_minutes: source.crawlFrequencyMinutes,
      parser_config: source.parserConfig ?? {},
      rate_limit_per_minute: source.rateLimitPerMinute,
      enabled: source.enabled,
      updated_at: new Date().toISOString(),
    })),
    "id",
  )

  await supabaseInsert("ingestion_runs", [
    {
      id: run.id,
      job_type: run.jobType,
      status: run.status,
      started_at: run.startedAt,
      finished_at: run.finishedAt,
      source_id: run.sourceId,
      documents_fetched: run.documentsFetched,
      documents_created: run.documentsCreated,
      duplicates: run.duplicates,
      events_created: run.eventsCreated,
      errors: run.errors,
      metadata: {},
    },
  ])

  await supabaseUpsert(
    "raw_documents",
    documents.map((document) => ({
      id: document.id,
      source_id: document.sourceId,
      canonical_url: document.canonicalUrl,
      normalized_url: document.normalizedUrl,
      title: document.title,
      publisher: document.publisher,
      author: document.author,
      publication_timestamp: document.publishedAt,
      update_timestamp: document.updatedAt,
      event_date: document.eventDate,
      language: document.language,
      clean_text: document.cleanText,
      excerpt: document.excerpt,
      source_type: document.rawContentType,
      original_country: document.originalCountry,
      content_hash: document.contentHash,
      raw_snapshot: document.rawSnapshot,
      provenance: { sourceTrustTier: document.sourceTrustTier },
      confidence: document.sourceTrustTier === 1 ? 0.65 : 0.35,
      last_verified_at: new Date().toISOString(),
      review_status: "pending",
    })),
    "id",
  )

  await supabaseUpsert(
    "normalized_documents",
    documents.map((document) => ({
      id: document.id,
      raw_document_id: document.id,
      document_type: document.documentType,
      canonical_url: document.canonicalUrl,
      title: document.title,
      publication_timestamp: document.publishedAt,
      affected_countries: document.affectedCountries,
      payment_rails: document.paymentRails,
      companies: document.companies,
      regulators: document.regulators,
      currencies: document.currencies,
      topics: document.topics,
      clean_text: document.cleanText,
      excerpt: document.excerpt,
      content_hash: document.contentHash,
      provenance: { sourceId: document.sourceId },
      confidence: document.sourceTrustTier === 1 ? 0.65 : 0.35,
      last_verified_at: new Date().toISOString(),
      review_status: "pending",
    })),
    "id",
  )

  await supabaseUpsert(
    "story_clusters",
    clusters.map((cluster) => ({
      id: cluster.id,
      canonical_name: cluster.title,
      primary_document_id: cluster.primaryDocumentId,
      canonical_url: cluster.canonicalUrl,
      earliest_publication_at: cluster.earliestPublishedAt,
      authoritative_source_id: cluster.authoritativeSourceId,
      document_ids: cluster.documentIds,
      supporting_sources: cluster.supportingSources,
      conflicting_claims: cluster.conflictingClaims,
      confidence: cluster.confidence === "high" ? 0.85 : cluster.confidence === "medium" ? 0.6 : 0.3,
      last_verified_at: new Date().toISOString(),
      review_status: "pending",
    })),
    "id",
  )

  await supabaseUpsert(
    "intelligence_events",
    events.map((event) => ({
      id: event.id,
      canonical_name: event.title,
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
      confidence: event.confidenceScore / 100,
      confidence_reasons: event.confidenceReasons,
      provenance: { evidence: event.evidence },
      last_verified_at: event.createdAt,
      review_status: event.reviewStatus,
    })),
    "id",
  )

  await supabaseInsert(
    "event_evidence",
    events.flatMap((event) =>
      event.evidence.map((evidence, index) => ({
        id: `${event.id}-evidence-${index}`,
        event_id: event.id,
        source_id: evidence.sourceId,
        source_url: evidence.sourceUrl,
        title: evidence.title,
        evidence_text: evidence.evidenceText,
        published_at: evidence.publishedAt,
        trust_tier: evidence.trustTier,
      })),
    ),
    "resolution=ignore-duplicates",
  )

  if (errors.length) {
    await supabaseInsert(
      "ingestion_errors",
      errors.map((error, index) => ({
        id: `${run.id}-error-${index}`,
        ingestion_run_id: run.id,
        source_id: error.sourceId,
        error_message: error.message,
        url: error.url,
      })),
      "return=minimal",
    )
  }
}
