import type { Confidence } from "@/lib/types"
import type { NormalizedDocument, StoryCluster } from "@/lib/ingestion/sourceTypes"

export function scoreClusterConfidence(cluster: StoryCluster, documents: NormalizedDocument[]) {
  const supporting = cluster.documentIds.map((id) => documents.find((document) => document.id === id)).filter((document): document is NormalizedDocument => Boolean(document))
  const bestTier = Math.min(...supporting.map((document) => document.sourceTrustTier), 4)
  const primary = bestTier === 1 ? 35 : bestTier === 2 ? 25 : bestTier === 3 ? 15 : 5
  const corroboration = Math.min(new Set(supporting.map((document) => document.sourceId)).size - 1, 3) * 12
  const explicitDate = supporting.some((document) => document.publishedAt || document.eventDate) ? 10 : 0
  const extractionCompleteness = supporting.some((document) => document.affectedCountries.length || document.paymentRails.length) ? 10 : 3
  const forwardLookingPenalty = supporting.some((document) => /\b(plan|intend|expected|will|aim|target|pilot)\b/i.test(`${document.title} ${document.excerpt ?? ""}`)) ? -8 : 0
  const score = Math.max(0, Math.min(100, primary + corroboration + explicitDate + extractionCompleteness + forwardLookingPenalty))
  return {
    score,
    confidence: confidenceFromScore(score),
    reasons: [
      bestTier === 1 ? "Primary or official source present." : `Best source tier is ${bestTier}.`,
      `${supporting.length} document(s) and ${new Set(supporting.map((document) => document.sourceId)).size} independent source(s) support the cluster.`,
      explicitDate ? "Publication or event date is explicit." : "No explicit date was extracted.",
      forwardLookingPenalty ? "Forward-looking language reduces confidence." : "No obvious forward-looking qualifier detected.",
    ],
  }
}

export function confidenceFromScore(score: number): Confidence {
  if (score >= 72) return "high"
  if (score >= 45) return "medium"
  return "low"
}
