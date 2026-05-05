"use client"

import Link from "next/link"
import { ArrowRight, Filter, Network, ShieldAlert, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import type { CountryFilters, CountryPaymentProfile } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { filterCountries, uniqueCurrencies, uniqueRegions, uniqueUseCases } from "@/lib/utils/filters"
import { mostActiveMarkets, recentlyUpdatedCountries } from "@/lib/utils/metrics"
import { formatDate } from "@/lib/utils"

export function FilterBar({ countries, onChange }: { countries: CountryPaymentProfile[]; onChange?: (results: CountryPaymentProfile[]) => void }) {
  const [filters, setFilters] = useState<CountryFilters>({})
  const regions = uniqueRegions(countries)
  const currencies = uniqueCurrencies(countries)
  const useCases = uniqueUseCases(countries)

  function update(next: CountryFilters) {
    setFilters(next)
    onChange?.(filterCountries(countries, next))
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <h2 className="text-lg font-semibold tracking-tight">Global Filters</h2>
        <span className="ml-auto rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500">Frontend filters</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <input
          className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
          placeholder="Search market, PSP, rail"
          value={filters.query ?? ""}
          onChange={(event) => update({ ...filters, query: event.target.value })}
        />
        <Select label="Region" value={filters.region ?? "all"} options={["all", ...regions]} onChange={(region) => update({ ...filters, region })} />
        <Select label="QR availability" value={filters.qrAvailability ?? "all"} options={["all", "yes", "no", "unknown"]} onChange={(qrAvailability) => update({ ...filters, qrAvailability: qrAvailability as CountryFilters["qrAvailability"] })} />
        <Select label="Cross-border" value={filters.crossBorderEnabled ?? "all"} options={["all", "yes", "no"]} onChange={(crossBorderEnabled) => update({ ...filters, crossBorderEnabled: crossBorderEnabled as CountryFilters["crossBorderEnabled"] })} />
        <Select label="Crypto" value={filters.cryptoStatus ?? "all"} options={["all", "legal", "regulated", "restricted", "banned", "unclear"]} onChange={(cryptoStatus) => update({ ...filters, cryptoStatus: cryptoStatus as CountryFilters["cryptoStatus"] })} />
        <Select label="Currency" value={filters.currency ?? "all"} options={["all", ...currencies]} onChange={(currency) => update({ ...filters, currency })} />
        <Select label="Scenario" value={filters.paymentScenario ?? "all"} options={["all", ...useCases]} onChange={(paymentScenario) => update({ ...filters, paymentScenario })} />
        <Select label="CPM/MPM" value={filters.qrMode ?? "all"} options={["all", "CPM", "MPM"]} onChange={(qrMode) => update({ ...filters, qrMode: qrMode as CountryFilters["qrMode"] })} />
        <Select label="Merchant coverage" value={filters.merchantCoverage ?? "all"} options={["all", "low", "medium", "high", "nationwide", "unknown"]} onChange={(merchantCoverage) => update({ ...filters, merchantCoverage: merchantCoverage as CountryFilters["merchantCoverage"] })} />
        <Select label="PSP access" value={filters.pspAccessClarity ?? "all"} options={["all", "direct_member", "sponsor_bank", "acquirer", "aggregator", "local_license_required", "unknown"]} onChange={(pspAccessClarity) => update({ ...filters, pspAccessClarity: pspAccessClarity as CountryFilters["pspAccessClarity"] })} />
        <Select label="Data freshness" value={filters.dataFreshness ?? "all"} options={["all", "30d", "90d", "stale"]} onChange={(dataFreshness) => update({ ...filters, dataFreshness: dataFreshness as CountryFilters["dataFreshness"] })} />
        <Select label="Regulatory risk" value={filters.regulatoryRisk ?? "all"} options={["all", "low", "medium", "high"]} onChange={(regulatoryRisk) => update({ ...filters, regulatoryRisk: regulatoryRisk as CountryFilters["regulatoryRisk"] })} />
      </div>
    </section>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-500">
      {label}
      <select className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-normal text-zinc-800" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  )
}

export function IntelligenceCards({ countries }: { countries: CountryPaymentProfile[] }) {
  const active = mostActiveMarkets(countries)
  const recent = recentlyUpdatedCountries(countries)
  const corridors = countries.flatMap((country) => country.interoperability).slice(0, 5)
  const cryptoFriendly = countries.filter((country) => ["legal", "regulated"].includes(country.cryptoRegulation.legalStatus)).slice(0, 5)
  const watchlist = countries.filter((country) => ["restricted", "banned", "unclear"].includes(country.cryptoRegulation.legalStatus)).slice(0, 5)
  const highPriority = active.filter((country) => country.pspOpportunity.opportunityScore >= 78)

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <IntelligenceCard title="Most active QR markets" icon={<Sparkles className="h-4 w-4" />} items={active.map((country) => ({ href: `/countries/${country.slug}`, label: country.countryName, meta: country.localSystems[0]?.name, badge: String(country.pspOpportunity.opportunityScore) }))} />
      <IntelligenceCard title="New interoperability corridors" icon={<Network className="h-4 w-4" />} items={corridors.map((corridor) => ({ href: "/interoperability", label: `${corridor.sourceCountry} to ${corridor.targetCountry}`, meta: corridor.networkOrOperator ?? "network unknown", badge: corridor.status }))} />
      <IntelligenceCard title="Recently updated countries" items={recent.map((country) => ({ href: `/countries/${country.slug}`, label: country.countryName, meta: formatDate(country.dataQuality.lastUpdated), badge: country.dataQuality.confidenceByCategory.qrSystem }))} />
      <IntelligenceCard title="Crypto-friendly payment markets" items={cryptoFriendly.map((country) => ({ href: `/countries/${country.slug}`, label: country.countryName, meta: country.cryptoRegulation.regulator ?? "regulator unknown", badge: country.cryptoRegulation.legalStatus }))} />
      <IntelligenceCard title="Regulatory watchlist" icon={<ShieldAlert className="h-4 w-4" />} items={watchlist.map((country) => ({ href: `/countries/${country.slug}`, label: country.countryName, meta: country.cryptoRegulation.riskSummary?.slice(0, 74), badge: country.cryptoRegulation.legalStatus }))} />
      <IntelligenceCard title="High-priority PSP opportunities" items={highPriority.map((country) => ({ href: `/countries/${country.slug}`, label: country.countryName, meta: country.pspOpportunity.suggestedRouteToMarket?.slice(0, 82), badge: String(country.pspOpportunity.opportunityScore) }))} />
    </section>
  )
}

function IntelligenceCard({ title, icon, items }: { title: string; icon?: React.ReactNode; items: Array<{ href: string; label: string; meta?: string; badge: string }> }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="mt-4 space-y-2">
        {items.slice(0, 5).map((item) => (
          <Link key={`${item.label}-${item.badge}`} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 transition hover:border-zinc-200 hover:bg-zinc-50">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{item.label}</p>
              {item.meta && <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{item.meta}</p>}
            </div>
            <span className="ml-auto">
              <StatusBadge value={item.badge} />
            </span>
            <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </article>
  )
}

export function InteroperabilityPreview({ countries }: { countries: CountryPaymentProfile[] }) {
  const corridors = useMemo(() => countries.flatMap((country) => country.interoperability).slice(0, 8), [countries])
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Interoperability Preview</h2>
          <p className="mt-1 text-sm text-zinc-500">Country-to-country payment rail and QR corridor view.</p>
        </div>
        <Link href="/interoperability" className="focus-ring rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50">Open matrix</Link>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-3">Corridor</th>
              <th className="px-4 py-3">Rail / QR</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Use case</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Last update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {corridors.map((corridor) => (
              <tr key={corridor.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{corridor.sourceCountry} &rarr; {corridor.targetCountry}</td>
                <td className="px-4 py-3 text-zinc-600">{corridor.sourceSystem ?? "unknown"} / {corridor.targetSystem ?? "unknown"}</td>
                <td className="px-4 py-3"><StatusBadge value={corridor.status} /></td>
                <td className="px-4 py-3 text-zinc-600">{corridor.useCases.join(", ")}</td>
                <td className="px-4 py-3"><StatusBadge value={corridor.confidence} /></td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">2026-05-04</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
