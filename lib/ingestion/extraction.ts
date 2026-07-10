import type { IntelligenceEvent, IntelligenceEventType, ReviewStatus } from "@/lib/intelligence/types"
import type { NormalizedDocument, StoryCluster } from "@/lib/ingestion/sourceTypes"
import { scoreClusterConfidence } from "@/lib/ingestion/confidence"

const eventRules: Array<{ type: IntelligenceEventType; patterns: RegExp[] }> = [
  { type: "cross_border_corridor_live", patterns: [/\b(goes live|went live|now live|launches cross-border|launched cross-border)\b/i] },
  { type: "cross_border_corridor_announced", patterns: [/\b(cross-border|interoperability|linked|linkage|corridor)\b/i, /\b(announce|agreement|mou|partnership|pilot)\b/i] },
  { type: "payment_rail_launched", patterns: [/\b(launch|launched|go live|rollout)\b/i, /\b(payment rail|instant payment|qr|wallet)\b/i] },
  { type: "pilot_announced", patterns: [/\b(pilot|trial|proof of concept|sandbox)\b/i] },
  { type: "merchant_acceptance_expanded", patterns: [/\b(merchant|acceptance|retail|pos|checkout)\b/i, /\b(expand|expanded|rollout|enable|accepted)\b/i] },
  { type: "new_bank_or_psp_participant", patterns: [/\b(bank|psp|wallet|acquirer|processor)\b/i, /\b(join|participant|member|onboard)\b/i] },
  { type: "partnership_announced", patterns: [/\b(partner|partnership|collaboration|mou|agreement)\b/i] },
  { type: "licensing_rule_changed", patterns: [/\b(license|licence|licensing|authorisation|authorization)\b/i, /\b(rule|requirement|framework|change|update)\b/i] },
  { type: "regulatory_consultation", patterns: [/\b(consultation|consult|feedback|proposal|draft)\b/i] },
  { type: "regulation_effective", patterns: [/\b(effective|comes into force|takes effect)\b/i, /\b(regulation|law|rule|framework)\b/i] },
  { type: "crypto_stablecoin_rule_changed", patterns: [/\b(crypto|stablecoin|digital asset|virtual asset)\b/i, /\b(rule|regulation|license|ban|restrict)\b/i] },
  { type: "cbdc_development", patterns: [/\b(cbdc|central bank digital currency|digital currency)\b/i] },
  { type: "outage", patterns: [/\b(outage|downtime|incident|disruption|unavailable)\b/i] },
  { type: "fraud_security_incident", patterns: [/\b(fraud|scam|security|breach|risk control)\b/i] },
]

export async function extractEventsFromClusters(clusters: StoryCluster[], documents: NormalizedDocument[]): Promise<IntelligenceEvent[]> {
  return clusters.map((cluster) => extractEvent(cluster, documents))
}

function extractEvent(cluster: StoryCluster, documents: NormalizedDocument[]): IntelligenceEvent {
  const clusterDocuments = cluster.documentIds.map((id) => documents.find((document) => document.id === id)).filter((document): document is NormalizedDocument => Boolean(document))
  const primary = clusterDocuments.find((document) => document.id === cluster.primaryDocumentId) ?? clusterDocuments[0]
  const text = `${primary.title} ${primary.excerpt ?? ""} ${primary.cleanText.slice(0, 1600)}`
  const confidence = scoreClusterConfidence(cluster, documents)
  const type = classifyEvent(text)
  const affectedCountries = unique(clusterDocuments.flatMap((document) => document.affectedCountries))
  const paymentRails = unique(clusterDocuments.flatMap((document) => document.paymentRails))
  const companies = unique(clusterDocuments.flatMap((document) => document.companies))
  const regulators = unique(clusterDocuments.flatMap((document) => document.regulators))
  const reviewStatus = statusFromConfidence(confidence.confidence, type)

  return {
    id: `event_${cluster.id.replace(/^cluster_/, "")}`,
    eventType: type,
    title: primary.title,
    summary: primary.excerpt || primary.cleanText.slice(0, 260) || primary.title,
    announcementDate: primary.publishedAt,
    eventDate: primary.eventDate,
    affectedCountries,
    originCountry: affectedCountries[0],
    destinationCountry: affectedCountries[1],
    paymentRails,
    companies,
    regulators,
    currencies: unique(clusterDocuments.flatMap((document) => document.currencies)),
    qrMode: /\bcpm\b/i.test(text) && /\bmpm\b/i.test(text) ? "both" : /\bcpm\b/i.test(text) ? "CPM" : /\bmpm\b/i.test(text) ? "MPM" : "not_stated",
    useCases: extractUseCases(text),
    corridorStatus: type === "cross_border_corridor_live" ? "live" : type === "cross_border_corridor_announced" ? "announced" : undefined,
    previousState: "not_stated",
    newState: newStateForType(type),
    commercialImpact: commercialImpactForType(type),
    recommendedBdAction: recommendedActionForType(type),
    unresolvedQuestions: unresolvedQuestions(type),
    confidence: confidence.confidence,
    confidenceScore: confidence.score,
    confidenceReasons: confidence.reasons,
    reviewStatus,
    evidence: cluster.supportingSources,
    createdAt: new Date().toISOString(),
  }
}

function classifyEvent(text: string): IntelligenceEventType {
  const rule = eventRules.find((candidate) => candidate.patterns.every((pattern) => pattern.test(text)))
  return rule?.type ?? "other"
}

function statusFromConfidence(confidence: IntelligenceEvent["confidence"], type: IntelligenceEventType): ReviewStatus {
  const sensitive = ["regulation_effective", "payment_activity_restricted_or_banned", "licensing_rule_changed", "cross_border_corridor_live"]
  if (confidence === "high") return "auto_published"
  if (confidence === "medium" && !sensitive.includes(type)) return "unconfirmed"
  return "needs_review"
}

function extractUseCases(text: string) {
  const useCases = [
    ["tourism", /\b(tourist|tourism|traveller|traveler)\b/i],
    ["remittance", /\b(remittance|p2p|person-to-person|transfer)\b/i],
    ["retail POS", /\b(merchant|retail|pos|store|shop)\b/i],
    ["e-commerce", /\b(e-commerce|online|checkout)\b/i],
    ["bill payments", /\b(bill|utility)\b/i],
  ] as const
  return useCases.filter(([, pattern]) => pattern.test(text)).map(([label]) => label)
}

function newStateForType(type: IntelligenceEventType) {
  if (type === "cross_border_corridor_live") return "corridor_live"
  if (type === "cross_border_corridor_announced") return "corridor_announced"
  if (type === "payment_rail_launched") return "rail_launched"
  if (type.includes("regulation") || type.includes("licensing")) return "regulatory_state_changed"
  return "signal_detected"
}

function commercialImpactForType(type: IntelligenceEventType) {
  if (type.includes("corridor")) return "Potential change to cross-border Scan-to-Pay acceptance, settlement, FX and partner prioritization."
  if (type.includes("regulation") || type.includes("licensing")) return "May alter market-entry requirements, review thresholds or operating permissions."
  if (type === "merchant_acceptance_expanded") return "Improves wallet acceptance and acquiring distribution assumptions."
  if (type === "new_bank_or_psp_participant") return "May create a new sponsor, processor, acquiring or wallet partnership path."
  return "Review the signal for BD timing, partner targeting and market scoring impact."
}

function recommendedActionForType(type: IntelligenceEventType) {
  if (type.includes("corridor")) return "Confirm launch status with primary operators, identify settlement and FX model, then update corridor opportunity score."
  if (type.includes("regulation") || type.includes("licensing")) return "Route to regulatory review, update market access assumptions and notify affected watchlists."
  if (type === "merchant_acceptance_expanded") return "Validate merchant categories and acceptance model before changing launch-priority scoring."
  return "Attach corroborating sources, resolve missing fields and decide whether to publish automatically or queue for analyst review."
}

function unresolvedQuestions(type: IntelligenceEventType) {
  const base = ["What is the primary official source?", "What effective date applies?", "Are there conflicting claims from other sources?"]
  if (type.includes("corridor")) return [...base, "Which rails, QR modes, settlement model and FX provider are confirmed?"]
  if (type.includes("regulation") || type.includes("licensing")) return [...base, "Does this affect foreign PSPs, wallets, acquirers or only local participants?"]
  return base
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 16)
}
