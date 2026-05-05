import type { CountryFilters, CountryPaymentProfile } from "@/lib/types"
import { riskFromCrypto } from "@/lib/utils/status"

export function filterCountries(countries: CountryPaymentProfile[], filters: CountryFilters) {
  const query = filters.query?.trim().toLowerCase()

  return countries.filter((country) => {
    const primarySystem = country.localSystems[0]
    const searchBlob = [
      country.countryName,
      country.currency.code,
      country.currency.name,
      primarySystem?.name,
      ...country.banksAndPsps.map((participant) => participant.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    if (query && !searchBlob.includes(query)) return false
    if (filters.region && filters.region !== "all" && country.region !== filters.region) return false
    if (filters.cryptoStatus && filters.cryptoStatus !== "all" && country.cryptoRegulation.legalStatus !== filters.cryptoStatus) return false
    if (filters.currency && filters.currency !== "all" && country.currency.code !== filters.currency) return false
    if (filters.qrMode && filters.qrMode !== "all" && !primarySystem?.qrModes?.includes(filters.qrMode)) return false
    if (filters.merchantCoverage && filters.merchantCoverage !== "all" && country.merchantCoverage.level !== filters.merchantCoverage) return false
    if (filters.crossBorderEnabled === "yes" && !country.interoperability.some((corridor) => corridor.status === "live")) return false
    if (filters.crossBorderEnabled === "no" && country.interoperability.some((corridor) => corridor.status === "live")) return false
    if (filters.qrAvailability === "yes" && !primarySystem?.type.includes("national_qr")) return false
    if (filters.qrAvailability === "no" && primarySystem?.type.includes("national_qr")) return false
    if (filters.paymentScenario && filters.paymentScenario !== "all" && !primarySystem?.useCases.includes(filters.paymentScenario)) return false
    if (filters.pspAccessClarity && filters.pspAccessClarity !== "all" && !country.banksAndPsps.some((participant) => participant.accessRoute === filters.pspAccessClarity)) return false
    if (filters.regulatoryRisk && filters.regulatoryRisk !== "all" && riskFromCrypto(country.cryptoRegulation) !== filters.regulatoryRisk) return false

    return true
  })
}

export function uniqueRegions(countries: CountryPaymentProfile[]) {
  return Array.from(new Set(countries.map((country) => country.region))).sort()
}

export function uniqueCurrencies(countries: CountryPaymentProfile[]) {
  return Array.from(new Set(countries.map((country) => country.currency.code))).sort()
}

export function uniqueUseCases(countries: CountryPaymentProfile[]) {
  return Array.from(new Set(countries.flatMap((country) => country.localSystems.flatMap((system) => system.useCases)))).sort()
}
