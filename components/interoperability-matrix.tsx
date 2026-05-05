"use client"

import { useMemo, useState } from "react"
import type { CountryPaymentProfile, InteroperabilityCorridor } from "@/lib/types"
import { StatusBadge, ConfidenceBadge } from "@/components/ui/status-badge"
import { countryWithFlag } from "@/lib/utils/country-flags"

export function InteroperabilityMatrix({ countries, corridors }: { countries: CountryPaymentProfile[]; corridors: InteroperabilityCorridor[] }) {
  const [status, setStatus] = useState("all")
  const [useCase, setUseCase] = useState("all")
  const useCases = Array.from(new Set(corridors.flatMap((corridor) => corridor.useCases))).sort()
  const filtered = useMemo(() => corridors.filter((corridor) => (status === "all" || corridor.status === status) && (useCase === "all" || corridor.useCases.includes(useCase))), [corridors, status, useCase])
  const countryNames = countries.map((country) => country.countryName)

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            {["all", "live", "pilot", "announced", "planned", "unclear"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" value={useCase} onChange={(event) => setUseCase(event.target.value)}>
            <option value="all">all use cases</option>
            {useCases.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" aria-label="Network filter placeholder">
            <option>all networks/operators</option>
          </select>
          <select className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" aria-label="Region filter placeholder">
            <option>all regions</option>
          </select>
        </div>
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold tracking-tight">Country x Country Matrix</h2>
        <div className="mt-4 overflow-auto rounded-2xl border border-zinc-200">
          <table className="text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="sticky left-0 z-10 bg-zinc-50 px-3 py-2">From / To</th>
                {countryNames.slice(0, 12).map((name) => <th key={name} className="min-w-[112px] px-3 py-2">{countryWithFlag(name)}</th>)}
              </tr>
            </thead>
            <tbody>
              {countryNames.slice(0, 12).map((source) => (
                <tr key={source} className="border-t border-zinc-200">
                  <td className="sticky left-0 bg-white px-3 py-2 font-medium">{countryWithFlag(source)}</td>
                  {countryNames.slice(0, 12).map((target) => {
                    const corridor = filtered.find((item) => item.sourceCountry === source && item.targetCountry === target)
                    return <td key={target} className="px-3 py-2">{corridor ? <StatusBadge value={corridor.status} /> : <span className="text-zinc-300">-</span>}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filtered.map((corridor) => (
          <article key={corridor.id} className="rounded-3xl border border-zinc-200 bg-white p-5 transition hover:bg-zinc-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold tracking-tight">{countryWithFlag(corridor.sourceCountry)} &rarr; {countryWithFlag(corridor.targetCountry)}</h3>
                <p className="mt-1 text-sm text-zinc-500">{countryWithFlag(corridor.sourceCountry)} {corridor.sourceSystem ?? "unknown"} / {countryWithFlag(corridor.targetCountry)} {corridor.targetSystem ?? "unknown"}</p>
              </div>
              <StatusBadge value={corridor.status} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-zinc-600">
              <p>Operator/network: {corridor.networkOrOperator ?? "unknown"}</p>
              <p>Use case: {corridor.useCases.join(", ")}</p>
              <p>Settlement: {corridor.settlementNotes ?? "requires verification"}</p>
              <p>FX: {corridor.fxNotes ?? "requires verification"}</p>
              <p>Merchant acceptance: {corridor.merchantAcceptanceNotes ?? "requires verification"}</p>
              <p>PSP relevance: {corridor.pspRelevance ?? "requires verification"}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <ConfidenceBadge value={corridor.confidence} />
              <StatusBadge value={corridor.sources.length ? "source placeholder" : "source missing"} />
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
