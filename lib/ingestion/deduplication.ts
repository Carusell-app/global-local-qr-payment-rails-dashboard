import type { NormalizedDocument, StoryCluster } from "@/lib/ingestion/sourceTypes"

export function clusterDocuments(documents: NormalizedDocument[]): StoryCluster[] {
  const clusters: StoryCluster[] = []

  documents.forEach((document) => {
    const existing = clusters.find((cluster) => belongsToCluster(document, cluster, documents))
    if (existing) {
      existing.documentIds.push(document.id)
      existing.supportingSources.push(evidenceFromDocument(document))
      if (document.publishedAt && (!existing.earliestPublishedAt || document.publishedAt < existing.earliestPublishedAt)) {
        existing.earliestPublishedAt = document.publishedAt
      }
      if (document.sourceTrustTier < trustTierForDocument(existing.authoritativeSourceId, documents)) {
        existing.authoritativeSourceId = document.sourceId
        existing.primaryDocumentId = document.id
        existing.canonicalUrl = document.canonicalUrl
      }
      return
    }

    clusters.push({
      id: `cluster_${document.contentHash.slice(0, 18)}`,
      primaryDocumentId: document.id,
      title: document.title,
      canonicalUrl: document.canonicalUrl,
      earliestPublishedAt: document.publishedAt,
      authoritativeSourceId: document.sourceId,
      documentIds: [document.id],
      supportingSources: [evidenceFromDocument(document)],
      conflictingClaims: [],
      confidence: document.sourceTrustTier <= 1 ? "medium" : "low",
    })
  })

  return clusters
}

function belongsToCluster(document: NormalizedDocument, cluster: StoryCluster, documents: NormalizedDocument[]) {
  if (document.canonicalUrl === cluster.canonicalUrl) return true
  if (cluster.documentIds.includes(document.id)) return true
  const primary = documents.find((item) => item.id === cluster.primaryDocumentId)
  if (!primary) return false
  if (document.contentHash === primary.contentHash) return true
  if (!sameTimeWindow(document.publishedAt, primary.publishedAt)) return false
  const entityOverlap = overlap([...document.affectedCountries, ...document.paymentRails, ...document.companies], [...primary.affectedCountries, ...primary.paymentRails, ...primary.companies])
  return titleSimilarity(document.title, primary.title) >= 0.72 && entityOverlap >= 0.25
}

function sameTimeWindow(left?: string, right?: string) {
  if (!left || !right) return true
  return Math.abs(new Date(left).getTime() - new Date(right).getTime()) <= 1000 * 60 * 60 * 24 * 21
}

export function titleSimilarity(left: string, right: string) {
  const a = tokens(left)
  const b = tokens(right)
  return overlap(a, b)
}

function overlap(left: string[], right: string[]) {
  if (!left.length || !right.length) return 0
  const a = new Set(left.map((item) => item.toLowerCase()))
  const b = new Set(right.map((item) => item.toLowerCase()))
  const intersection = Array.from(a).filter((item) => b.has(item)).length
  return intersection / Math.max(a.size, b.size)
}

function tokens(value: string) {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2)
}

function evidenceFromDocument(document: NormalizedDocument) {
  return {
    sourceId: document.sourceId,
    sourceName: document.publisher,
    sourceUrl: document.canonicalUrl,
    title: document.title,
    publishedAt: document.publishedAt,
    evidenceText: document.excerpt,
    trustTier: document.sourceTrustTier,
  }
}

function trustTierForDocument(sourceId: string, documents: NormalizedDocument[]) {
  return documents.find((document) => document.sourceId === sourceId)?.sourceTrustTier ?? 4
}
