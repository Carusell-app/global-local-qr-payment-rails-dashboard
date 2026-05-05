import type { CountryPaymentProfile } from "@/lib/types"

export function getGlobalMetrics(countries: CountryPaymentProfile[]) {
  const systems = countries.flatMap((country) => country.localSystems)
  const corridors = countries.flatMap((country) => country.interoperability)
  const participants = countries.flatMap((country) => country.banksAndPsps)
  const qrSystems = systems.filter((system) => system.type.includes("national_qr"))
  const updatedThisWeek = countries.filter((country) => {
    const updated = new Date(country.dataQuality.lastUpdated).getTime()
    const now = new Date("2026-05-05").getTime()
    return now - updated <= 7 * 24 * 60 * 60 * 1000
  })

  return {
    countriesTracked: countries.length,
    qrSystemsIdentified: qrSystems.length,
    crossBorderCorridors: corridors.filter((corridor) => corridor.status === "live").length,
    pspBankParticipants: participants.length,
    newsUpdatesThisWeek: countries.flatMap((country) => country.news).length,
    updatedThisWeek: updatedThisWeek.length,
  }
}

export function mostActiveMarkets(countries: CountryPaymentProfile[]) {
  return [...countries]
    .sort((a, b) => b.pspOpportunity.opportunityScore - a.pspOpportunity.opportunityScore)
    .slice(0, 5)
}

export function recentlyUpdatedCountries(countries: CountryPaymentProfile[]) {
  return [...countries].sort((a, b) => b.dataQuality.lastUpdated.localeCompare(a.dataQuality.lastUpdated)).slice(0, 5)
}

export function groupByRegion(countries: CountryPaymentProfile[]) {
  return countries.reduce<Record<string, CountryPaymentProfile[]>>((acc, country) => {
    acc[country.region] ??= []
    acc[country.region].push(country)
    return acc
  }, {})
}
