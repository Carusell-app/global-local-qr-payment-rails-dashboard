"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import { BarChart3, ExternalLink, FileText, Landmark, Library, Network, Shield, WalletCards } from "lucide-react"
import { Bar, BarChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { CountryPaymentProfile, NewsItem, Participant } from "@/lib/types"
import { ConfidenceBadge, SeedBadge, StatusBadge } from "@/components/ui/status-badge"
import { MetricCard } from "@/components/ui/metric-card"
import { formatDate, humanize } from "@/lib/utils"
import { confidenceScore, maturityLabel, riskFromCrypto } from "@/lib/utils/status"
import { countryWithFlag } from "@/lib/utils/country-flags"

const nav = [
  "summary",
  "rails",
  "interoperability",
  "merchants",
  "participants",
  "currency",
  "crypto",
  "news",
  "sources",
  "opportunity",
  "quality",
]

export function CountryHero({ country }: { country: CountryPaymentProfile }) {
  const system = country.localSystems[0]
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-5xl">{country.flagEmoji}</span>
            <div>
              <p className="text-sm text-zinc-500">{country.region}{country.subregion ? ` / ${country.subregion}` : ""}</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight text-zinc-950">{country.countryName}</h1>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600">
            {system?.name} operated by {system?.operator ?? "unknown operator"} under {system?.regulator ?? "regulator unknown"}. This is a seed intelligence profile designed for later source-backed ingestion.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <SeedBadge />
            <StatusBadge value={maturityLabel(system)} />
            <StatusBadge value={`${country.currency.code} currency`} />
            <StatusBadge value={`${country.cryptoRegulation.legalStatus} crypto`} />
            <StatusBadge value={`${riskFromCrypto(country.cryptoRegulation)} regulatory risk`} />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:w-[360px]">
          <Link href="#sources" className="focus-ring rounded-full border border-zinc-200 px-4 py-2 text-center text-sm font-medium transition hover:bg-zinc-50">Open source links</Link>
          <Link href="/countries" className="focus-ring rounded-full border border-zinc-200 px-4 py-2 text-center text-sm font-medium transition hover:bg-zinc-50">Compare countries</Link>
          <MetricCard label="Last updated" value={formatDate(country.dataQuality.lastUpdated)} className="sm:col-span-2" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="QR status" value={system?.status ?? "unknown"} />
        <MetricCard label="Instant rail" value={system?.type.includes("instant_payment") ? "yes" : "unknown"} />
        <MetricCard label="Cross-border" value={country.interoperability.some((item) => item.status === "live") ? "live" : "watch"} />
        <MetricCard label="Merchant coverage" value={country.merchantCoverage.level} />
        <MetricCard label="PSP difficulty" value={country.pspOpportunity.accessDifficulty} />
        <MetricCard label="Opportunity" value={country.pspOpportunity.opportunityScore} />
      </div>
    </section>
  )
}

export function CountryReport({ country }: { country: CountryPaymentProfile }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-3">
          {nav.map((item) => (
            <a key={item} href={`#${item}`} className="focus-ring block rounded-2xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950">
              {humanize(item)}
            </a>
          ))}
        </div>
      </aside>
      <div className="space-y-6">
        <CountrySummary country={country} />
        <PaymentSystemOverview country={country} />
        <InteroperabilitySection country={country} />
        <MerchantCoverageSection country={country} />
        <ParticipantsTable participants={country.banksAndPsps} />
        <CurrencyFxSection country={country} />
        <CryptoRegulationCard country={country} />
        <NewsFeed news={country.news} />
        <SourceLibrary country={country} />
        <PspOpportunityScore country={country} />
        <DataQualityPanel country={country} />
      </div>
    </div>
  )
}

export function CountrySummary({ country }: { country: CountryPaymentProfile }) {
  const system = country.localSystems[0]
  return (
    <Section id="summary" title="Executive Summary" icon={<FileText className="h-5 w-5" />}>
      <p className="max-w-4xl text-base leading-7 text-zinc-700">
        {country.countryName} is tracked as a {maturityLabel(system).toLowerCase()} market for {system?.name}. The primary opportunity is shaped by {country.merchantCoverage.level} merchant coverage, {country.interoperability.length} tracked cross-border corridor(s), and a PSP opportunity score of {country.pspOpportunity.opportunityScore}. For PSPs, the main route to market is currently modeled as: {country.pspOpportunity.suggestedRouteToMarket}
      </p>
      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        This country report still requires source verification before operational use. Official sources, regulator pages, RSS feeds and analyst validation can be connected through the ingestion layer.
      </p>
    </Section>
  )
}

export function PaymentSystemOverview({ country }: { country: CountryPaymentProfile }) {
  const system = country.localSystems[0]
  const rows: Array<[string, React.ReactNode]> = [
    ["System name", system?.name ?? "unknown"],
    ["Local brand", system?.localBrandName ?? "unknown"],
    ["Operator", system?.operator ?? "unknown"],
    ["Regulator / central bank", system?.regulator ?? "unknown"],
    ["Payment type", system?.type.join(", ").replaceAll("_", " ") ?? "unknown"],
    ["QR standard", system?.qrStandard ?? "unknown"],
    ["QR mode", system?.qrModes?.join(" / ") || "unknown"],
    ["Settlement model", system?.settlementModel ?? "unknown"],
    ["Access model", system?.accessModel ?? "unknown"],
    ["Merchant onboarding", "Seed model: through acquiring bank, PSP, wallet, aggregator or direct scheme membership depending on country rules."],
    ["Consumer onboarding", "Seed model: bank account, wallet app, national ID/phone proxy or app enrollment depending on system."],
    ["Known limitations", system?.notes ?? "unknown"],
    ["Public docs", system?.documentationUrls?.join(", ") ?? "unknown"],
  ]
  return (
    <Section id="rails" title="Local QR / Payment Rail Overview" icon={<WalletCards className="h-5 w-5" />}>
      <DefinitionGrid rows={rows} />
      <div className="mt-5">
        <p className="text-sm font-medium text-zinc-950">Supported use cases</p>
        <div className="mt-2 flex flex-wrap gap-2">{system?.useCases.map((item) => <StatusBadge key={item} value={item} />)}</div>
      </div>
    </Section>
  )
}

export function InteroperabilitySection({ country }: { country: CountryPaymentProfile }) {
  return (
    <Section id="interoperability" title="Cross-Border Interoperability" icon={<Network className="h-5 w-5" />}>
      <div className="grid gap-3 xl:grid-cols-2">
        {country.interoperability.map((corridor) => (
          <article key={corridor.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{countryWithFlag(corridor.sourceCountry)} &rarr; {countryWithFlag(corridor.targetCountry)}</h3>
                <p className="mt-1 text-sm text-zinc-500">{countryWithFlag(corridor.sourceCountry)} {corridor.sourceSystem ?? "unknown rail"} / {countryWithFlag(corridor.targetCountry)} {corridor.targetSystem ?? "unknown target"}</p>
              </div>
              <StatusBadge value={corridor.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{corridor.useCases.map((useCase) => <StatusBadge key={useCase} value={useCase} />)}</div>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{corridor.pspRelevance ?? "PSP relevance requires verification."}</p>
            <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
              <span>Network: {corridor.networkOrOperator ?? "unknown"}</span>
              <span>Launch: {corridor.launchDate ?? "unknown"}</span>
              <span>Settlement: {corridor.settlementNotes ?? "requires verification"}</span>
              <span>FX: {corridor.fxNotes ?? "requires verification"}</span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

export function MerchantCoverageSection({ country }: { country: CountryPaymentProfile }) {
  const coverage = country.merchantCoverage
  return (
    <Section id="merchants" title="Merchant Coverage" icon={<Landmark className="h-5 w-5" />}>
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs text-zinc-500">Coverage level</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{coverage.level}</p>
          <p className="mt-2 text-sm text-zinc-500">Estimated merchant count: {coverage.estimatedMerchants?.toLocaleString() ?? "not asserted in seed data"}</p>
          <div className="mt-4"><ConfidenceBadge value={coverage.confidence} /></div>
        </div>
        <div>
          <p className="text-sm font-medium">Merchant categories</p>
          <div className="mt-2 flex flex-wrap gap-2">{coverage.merchantCategories.map((item) => <StatusBadge key={item} value={item} />)}</div>
          <p className="mt-4 text-sm font-medium">QR types</p>
          <div className="mt-2 flex flex-wrap gap-2">{coverage.qrTypes.map((item) => <StatusBadge key={item} value={item} />)}</div>
          <p className="mt-4 text-sm text-zinc-600">Known chains: {coverage.knownChains?.join(", ") || "requires verification"}</p>
          <p className="mt-2 text-sm text-zinc-600">PSP notes: {coverage.notes}</p>
        </div>
      </div>
    </Section>
  )
}

export function ParticipantsTable({ participants }: { participants: Participant[] }) {
  return (
    <Section id="participants" title="Banks, PSPs and Wallet Participants" icon={<Library className="h-5 w-5" />}>
      <div className="overflow-hidden rounded-2xl border border-zinc-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs text-zinc-500">
            <tr>
              {["Name", "Type", "Role in system", "Access route", "Known capabilities", "Website/source", "Confidence", "Last verified"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {participants.map((participant) => (
              <tr key={participant.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{participant.name}</td>
                <td className="px-4 py-3"><StatusBadge value={participant.type} /></td>
                <td className="px-4 py-3 text-zinc-600">{participant.role}</td>
                <td className="px-4 py-3"><StatusBadge value={participant.accessRoute ?? "unknown"} /></td>
                <td className="px-4 py-3 text-zinc-600">{participant.capabilities?.join(", ") ?? "unknown"}</td>
                <td className="px-4 py-3 text-zinc-500">{participant.website ?? "placeholder source"}</td>
                <td className="px-4 py-3"><ConfidenceBadge value={participant.confidence} /></td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{participant.lastVerified ?? "unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

export function CurrencyFxSection({ country }: { country: CountryPaymentProfile }) {
  return (
    <Section id="currency" title="Currency and FX" icon={<BarChart3 className="h-5 w-5" />}>
      <DefinitionGrid
        rows={[
          ["National currency", `${country.currency.name} (${country.currency.code})`],
          ["Symbol", country.currency.symbol ?? "unknown"],
          ["FX notes", country.currency.settlementNotes ?? "requires verification"],
          ["Settlement currency", country.currency.code],
          ["Cross-border local settlement", "Corridor-specific; not asserted in seed data."],
          ["Foreign wallet home-currency payment", "Requires wallet and FX partner verification."],
          ["Merchant local-currency receipt", "Assumed local currency for domestic acquiring; verify by corridor."],
          ["FX provider", "unknown"],
          ["PSP risk notes", "FX spread, refund handling, chargeback-equivalent disputes and regulatory reporting require corridor-level diligence."],
        ]}
      />
    </Section>
  )
}

export function CryptoRegulationCard({ country }: { country: CountryPaymentProfile }) {
  const crypto = country.cryptoRegulation
  return (
    <Section id="crypto" title="Crypto Regulation" icon={<Shield className="h-5 w-5" />}>
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Legal status" value={crypto.legalStatus} />
        <MetricCard label="Crypto payments" value={crypto.cryptoPaymentsAllowed} />
        <MetricCard label="Exchanges" value={crypto.exchangesAllowed} />
      </div>
      <DefinitionGrid
        rows={[
          ["Stablecoins", crypto.stablecoinStatus ?? "unclear"],
          ["CBDC", crypto.cbdcStatus ?? "unknown"],
          ["Major regulator", crypto.regulator ?? "unknown"],
          ["AML/KYC notes", crypto.amlKycNotes],
          ["Tax notes", crypto.taxNotes],
          ["Risk summary", crypto.riskSummary],
          ["Source links", crypto.sources.join(", ")],
          ["Last updated", crypto.lastUpdated],
          ["Confidence", crypto.confidence],
        ]}
      />
    </Section>
  )
}

export function NewsFeed({ news }: { news: NewsItem[] }) {
  return (
    <Section id="news" title="News & Updates" icon={<FileText className="h-5 w-5" />}>
      <div className="space-y-3">
        {news.map((item) => (
          <article key={item.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={item.category} />
              <StatusBadge value={item.sourceType} />
              <ConfidenceBadge value={item.confidence} />
              <span className="font-mono text-xs text-zinc-500">{formatDate(item.date)}</span>
            </div>
            <h3 className="mt-3 font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{item.summary}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-700"><span className="font-medium text-zinc-950">Why this matters for PSPs:</span> {item.whyItMattersForPsps}</p>
            <p className="mt-2 text-xs text-zinc-500">Source: {item.sourceName} / Last parsed: {item.parsedAt ?? "unknown"}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

export function SourceLibrary({ country }: { country: CountryPaymentProfile }) {
  return (
    <Section id="sources" title="Source Library" icon={<ExternalLink className="h-5 w-5" />}>
      <div className="grid gap-3 lg:grid-cols-3">
        {country.sources.map((source) => (
          <a key={source.id} href={source.url} className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white" target="_blank" rel="noreferrer">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{source.title}</h3>
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge value={source.sourceType} />
              <StatusBadge value={`${source.reliability} reliability`} />
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{source.notes}</p>
          </a>
        ))}
      </div>
    </Section>
  )
}

export function PspOpportunityScore({ country }: { country: CountryPaymentProfile }) {
  const mounted = useMounted()
  const score = country.pspOpportunity
  const chartData = [
    { subject: "Market", value: score.marketAttractiveness },
    { subject: "Access", value: 100 - score.accessDifficulty },
    { subject: "Regulation", value: 100 - score.regulatoryComplexity },
    { subject: "Cross-border", value: score.crossBorderPotential },
    { subject: "Merchants", value: score.merchantReadiness },
    { subject: "Adoption", value: score.consumerAdoptionSignal },
    { subject: "Crypto", value: score.cryptoCompatibility },
  ]
  return (
    <Section id="opportunity" title="PSP Opportunity Assessment" icon={<BarChart3 className="h-5 w-5" />}>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="text-xs text-zinc-500">Opportunity score</p>
          <p className="mt-3 font-mono text-6xl font-semibold tracking-tight">{score.opportunityScore}</p>
          <p className="mt-4 text-sm leading-6 text-zinc-600">{score.suggestedRouteToMarket}</p>
        </div>
        <div className="h-[320px] min-h-[320px] rounded-3xl border border-zinc-200 bg-white p-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={240}>
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#52525b", fontSize: 12 }} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-zinc-400">Loading opportunity chart</div>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {score.keyOpenQuestions.map((question) => <p key={question} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">{question}</p>)}
      </div>
    </Section>
  )
}

export function DataQualityPanel({ country }: { country: CountryPaymentProfile }) {
  const mounted = useMounted()
  const values = Object.entries(country.dataQuality.confidenceByCategory).map(([name, confidence]) => ({
    name: humanize(name),
    value: confidenceScore(confidence),
  }))
  return (
    <Section id="quality" title="Data Freshness and Confidence" icon={<Shield className="h-5 w-5" />}>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="h-[260px] min-h-[260px] rounded-3xl border border-zinc-200 bg-white p-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={200}>
              <BarChart data={values}>
                <XAxis dataKey="name" tick={{ fill: "#52525b", fontSize: 11 }} />
                <YAxis hide domain={[0, 100]} />
                <Bar dataKey="value" fill="#18181b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-zinc-400">Loading confidence chart</div>
          )}
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <p className="text-sm text-zinc-600">Last source check: {country.dataQuality.lastSourceCheck ?? "unknown"}</p>
          <p className="mt-2 text-sm text-zinc-600">Number of sources: {country.dataQuality.numberOfSources}</p>
          <div className="mt-4 space-y-2">
            {country.dataQuality.warnings.map((warning) => <p key={warning} className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{warning}</p>)}
          </div>
        </div>
      </div>
    </Section>
  )
}

function useMounted() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-3xl border border-zinc-200 bg-white p-5 lg:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700">{icon}</span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DefinitionGrid({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-2 border-b border-zinc-200 px-4 py-3 last:border-b-0 md:grid-cols-[240px_1fr]">
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <div className="text-sm leading-6 text-zinc-800">{value ?? "unknown"}</div>
        </div>
      ))}
    </div>
  )
}
