"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { LayoutGrid, Rows3, Search } from "lucide-react"
import type { CountryPaymentProfile } from "@/lib/types"
import { StatusBadge, ConfidenceBadge } from "@/components/ui/status-badge"
import { filterCountries, groupByRegionCompat, uniqueRegions } from "@/lib/utils/filters-client"

type ViewMode = "table" | "cards" | "regions"

export function CountryTable({ countries }: { countries: CountryPaymentProfile[] }) {
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("all")
  const [view, setView] = useState<ViewMode>("table")
  const filtered = useMemo(() => filterCountries(countries, { query, region }), [countries, query, region])
  const regions = uniqueRegions(countries)

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input className="focus-ring w-full bg-transparent text-sm outline-none" placeholder="Search by country, rail, PSP or currency" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <select className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="all">All regions</option>
            {regions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
            <ModeButton active={view === "table"} onClick={() => setView("table")} icon={<Rows3 className="h-4 w-4" />} label="Table" />
            <ModeButton active={view === "cards"} onClick={() => setView("cards")} icon={<LayoutGrid className="h-4 w-4" />} label="Cards" />
            <ModeButton active={view === "regions"} onClick={() => setView("regions")} label="Region" />
          </div>
        </div>
      </div>

      {view === "table" && <TableView countries={filtered} />}
      {view === "cards" && <CardView countries={filtered} />}
      {view === "regions" && <RegionView countries={filtered} />}
    </section>
  )
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon?: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition ${active ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-950"}`}>
      {icon}
      {label}
    </button>
  )
}

function TableView({ countries }: { countries: CountryPaymentProfile[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-zinc-500">
            <tr>
              {["Country", "Region", "Currency", "System name", "QR status", "CPM/MPM", "Cross-border", "Crypto", "Top PSP access", "Merchant coverage", "Last updated", "Confidence"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {countries.map((country) => {
              const system = country.localSystems[0]
              const access = country.banksAndPsps[0]?.accessRoute ?? "unknown"
              return (
                <tr key={country.slug} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link href={`/countries/${country.slug}`} className="font-medium hover:underline">{country.flagEmoji} {country.countryName}</Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{country.region}</td>
                  <td className="px-4 py-3 font-mono text-xs">{country.currency.code}</td>
                  <td className="px-4 py-3 text-zinc-600">{system?.name}</td>
                  <td className="px-4 py-3"><StatusBadge value={system?.status ?? "unknown"} /></td>
                  <td className="px-4 py-3 text-zinc-600">{system?.qrModes?.join(" / ") || "unknown"}</td>
                  <td className="px-4 py-3"><StatusBadge value={country.interoperability.some((item) => item.status === "live") ? "live" : "watch"} /></td>
                  <td className="px-4 py-3"><StatusBadge value={country.cryptoRegulation.legalStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge value={access} /></td>
                  <td className="px-4 py-3"><StatusBadge value={country.merchantCoverage.level} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{country.dataQuality.lastUpdated}</td>
                  <td className="px-4 py-3"><ConfidenceBadge value={country.dataQuality.confidenceByCategory.qrSystem} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CardView({ countries }: { countries: CountryPaymentProfile[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {countries.map((country) => (
        <Link key={country.slug} href={`/countries/${country.slug}`} className="rounded-3xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:bg-zinc-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl">{country.flagEmoji}</p>
              <h3 className="mt-3 font-semibold tracking-tight">{country.countryName}</h3>
              <p className="mt-1 text-sm text-zinc-500">{country.localSystems[0]?.name}</p>
            </div>
            <p className="font-mono text-2xl font-semibold">{country.pspOpportunity.opportunityScore}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge value={country.localSystems[0]?.status ?? "unknown"} />
            <StatusBadge value={country.cryptoRegulation.legalStatus} />
            <StatusBadge value={country.merchantCoverage.level} />
          </div>
        </Link>
      ))}
    </div>
  )
}

function RegionView({ countries }: { countries: CountryPaymentProfile[] }) {
  const grouped = groupByRegionCompat(countries)
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([region, items]) => (
        <section key={region} className="rounded-3xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold tracking-tight">{region}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {items.map((country) => (
              <Link key={country.slug} href={`/countries/${country.slug}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white">
                <p className="font-medium">{country.flagEmoji} {country.countryName}</p>
                <p className="mt-1 text-sm text-zinc-500">{country.localSystems[0]?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
