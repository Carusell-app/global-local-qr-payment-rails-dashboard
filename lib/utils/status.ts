import type { Confidence, CountryPaymentProfile, CryptoRegulationProfile, LocalPaymentSystem } from "@/lib/types"

export function statusTone(status: string) {
  if (["live", "mature", "legal", "regulated", "high", "nationwide"].includes(status)) return "green"
  if (["pilot", "medium", "unclear", "unknown"].includes(status)) return "amber"
  if (["banned", "restricted", "low"].includes(status)) return "red"
  if (["announced", "planned", "active"].includes(status)) return "blue"
  return "slate"
}

export function maturityLabel(system?: LocalPaymentSystem) {
  if (!system) return "Unknown"
  if (system.status === "mature") return "Mature"
  if (system.status === "active") return "Active national rollout"
  if (system.status === "pilot") return "Pilot"
  if (system.status === "planned") return "Planned"
  if (system.status === "restricted") return "Restricted"
  return "Unknown"
}

export function countryMaturity(country: CountryPaymentProfile) {
  const system = country.localSystems[0]
  if (country.interoperability.some((corridor) => corridor.status === "live")) return "cross-border enabled"
  return maturityLabel(system).toLowerCase()
}

export function riskFromCrypto(crypto: CryptoRegulationProfile) {
  if (crypto.legalStatus === "banned" || crypto.cryptoPaymentsAllowed === "no") return "high"
  if (crypto.legalStatus === "restricted" || crypto.cryptoPaymentsAllowed === "unclear") return "medium"
  return "low"
}

export function confidenceScore(confidence: Confidence) {
  return confidence === "high" ? 92 : confidence === "medium" ? 68 : 38
}
