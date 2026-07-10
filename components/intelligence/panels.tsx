import Link from "next/link"
import { AlertTriangle, ArrowRight, Bell, Building2, DatabaseZap, FileSearch, Network, RadioTower, Shield, Target } from "lucide-react"
import type {
  CompanyProfile,
  DashboardFreshness,
  GeneratedAlert,
  IngestionRunSummary,
  IntelligenceEvent,
  OpportunityCard,
  RegulatoryItem,
  SourceHealth,
  Watchlist,
} from "@/lib/intelligence/types"
import type { CountryPaymentProfile, InteroperabilityCorridor, NewsItem } from "@/lib/types"
import { MetricCard } from "@/components/ui/metric-card"
import { ConfidenceBadge, StatusBadge } from "@/components/ui/status-badge"
import { formatDate, humanize } from "@/lib/utils"

export function FreshnessGrid({ freshness }: { freshness: DashboardFreshness }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Last successful sync" value={freshness.lastSuccessfulSync ? formatDate(freshness.lastSuccessfulSync) : "not run"} />
      <MetricCard label="Sources monitored" value={freshness.sourceCount} />
      <MetricCard label="Failing sources" value={freshness.failingSources} />
      <MetricCard label="New documents 24h" value={freshness.newDocuments24h} />
      <MetricCard label="Pending review" value={freshness.pendingReviews} />
    </section>
  )
}

export function EventFeed({ events }: { events: IntelligenceEvent[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {events.slice(0, 12).map((event) => (
        <article key={event.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={event.eventType} />
            <StatusBadge value={event.reviewStatus} />
            <ConfidenceBadge value={event.confidence} />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">{event.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{event.summary}</p>
          <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
            <p><span className="font-medium text-[var(--text-primary)]">Publisher:</span> {event.evidence[0]?.sourceName ?? "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Publication date:</span> {event.evidence[0]?.publishedAt ? formatDate(event.evidence[0].publishedAt) : "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Event date:</span> {event.eventDate ? formatDate(event.eventDate) : "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Countries:</span> {event.affectedCountries.join(", ") || "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Payment rails:</span> {event.paymentRails.join(", ") || "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Companies:</span> {event.companies.join(", ") || "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Regulators:</span> {event.regulators.join(", ") || "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Changed:</span> {event.previousState ?? "unknown"} to {event.newState ?? "signal_detected"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Business impact:</span> {event.commercialImpact}</p>
            <p><span className="font-medium text-[var(--text-primary)]">BD action:</span> {event.recommendedBdAction}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Confidence explanation:</span> {event.confidenceReasons.join(" ") || "not stated"}</p>
            <p><span className="font-medium text-[var(--text-primary)]">Dashboards updated:</span> {(event.dashboardsUpdated ?? ["Live Intelligence"]).join(", ")}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {event.affectedCountries.map((item) => <StatusBadge key={item} value={item} />)}
            {event.paymentRails.map((item) => <StatusBadge key={item} value={item} />)}
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Supporting sources</p>
            {event.evidence.length ? event.evidence.map((source) => (
              <a key={`${event.id}-${source.sourceUrl}`} href={source.sourceUrl} target="_blank" rel="noreferrer" className="block rounded-xl bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--brand-primary)]">
                {source.title || source.sourceName}
                <span className="block text-xs text-[var(--text-muted)]">{source.sourceUrl}</span>
              </a>
            )) : <p className="text-xs text-[var(--text-muted)]">No source evidence attached.</p>}
          </div>
        </article>
      ))}
    </section>
  )
}

export function NewsCards({ news }: { news: NewsItem[] }) {
  return (
    <section className="space-y-3">
      {news.slice(0, 30).map((item) => (
        <article key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={item.category} />
            <StatusBadge value={item.sourceType} />
            <ConfidenceBadge value={item.confidence} />
            <span className="font-mono text-xs text-[var(--text-muted)]">{formatDate(item.date)}</span>
          </div>
          <h3 className="mt-3 font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.summary}</p>
          <p className="mt-2 text-sm text-[var(--text-primary)]"><span className="font-medium">Business impact:</span> {item.whyItMattersForPsps}</p>
          {item.sourceUrl ? (
            <a href={item.sourceUrl} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-primary)]" target="_blank" rel="noreferrer">
              {item.sourceName} <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <p className="mt-3 text-xs text-[var(--text-muted)]">{item.sourceName}</p>
          )}
        </article>
      ))}
    </section>
  )
}

export function SourceHealthTable({ sources }: { sources: SourceHealth[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-xs text-[var(--text-secondary)]">
            <tr>
              {["Source", "Tier", "Type", "Markets", "Method", "Freshness", "Last fetch", "Failures", "Documents"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {sources.map((source) => (
              <tr key={source.id}>
                <td className="px-4 py-3">
                  <a href={source.url} target="_blank" rel="noreferrer" className="font-medium hover:text-[var(--brand-primary)]">{source.name}</a>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{source.domain}</p>
                </td>
                <td className="px-4 py-3">Tier {source.trustTier}</td>
                <td className="px-4 py-3"><StatusBadge value={source.sourceType} /></td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{source.countriesCovered.join(", ") || "global"}</td>
                <td className="px-4 py-3"><StatusBadge value={source.ingestionMethod} /></td>
                <td className="px-4 py-3"><StatusBadge value={source.freshnessStatus} /></td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{source.lastSuccessfulFetch ? formatDate(source.lastSuccessfulFetch) : "not fetched"}</td>
                <td className="px-4 py-3">{source.consecutiveFailures}</td>
                <td className="px-4 py-3">{source.documentsFetched ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function OpportunityList({ opportunities }: { opportunities: OpportunityCard[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {opportunities.slice(0, 20).map((opportunity) => (
        <article key={opportunity.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">{opportunity.market}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{opportunity.title}</h3>
            </div>
            <p className="font-mono text-4xl font-semibold">{opportunity.score}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{opportunity.whyNow}</p>
          <p className="mt-3 text-sm"><span className="font-medium">Angle:</span> {opportunity.commercialAngle}</p>
          <p className="mt-2 text-sm"><span className="font-medium">Next action:</span> {opportunity.suggestedNextAction}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {opportunity.components.map((component) => (
              <div key={component.label} className="rounded-xl bg-[var(--surface-subtle)] px-3 py-2">
                <p className="text-xs text-[var(--text-muted)]">{component.label} / {Math.round(component.weight * 100)}%</p>
                <p className="mt-1 font-mono text-lg font-semibold">{component.value}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

export function CompanyDirectory({ companies }: { companies: CompanyProfile[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {companies.slice(0, 36).map((company) => (
        <article key={company.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface-subtle)]"><Building2 className="h-5 w-5" /></span>
            <div>
              <h3 className="font-semibold">{company.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{humanize(company.type)}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{company.markets.slice(0, 5).map((market) => <StatusBadge key={market} value={market} />)}</div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Rails: {company.rails.slice(0, 5).join(", ") || "not stated"}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Signal: {company.recentSignals[0] ?? "No recent signal"}</p>
        </article>
      ))}
    </section>
  )
}

export function RegulationTable({ items }: { items: RegulatoryItem[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-xs text-[var(--text-secondary)]">
            <tr>
              {["Market", "Regulator", "Topic", "Status", "Effective", "Impact", "Confidence"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.country}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{item.regulator}</td>
                <td className="px-4 py-3">{item.topic}</td>
                <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{item.effectiveDate ?? "not stated"}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{item.impact}</td>
                <td className="px-4 py-3"><ConfidenceBadge value={item.confidence} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function WatchlistCards({ watchlists, alerts }: { watchlists: Watchlist[]; alerts: GeneratedAlert[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <section className="grid gap-4">
        {watchlists.map((watchlist) => (
          <article key={watchlist.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{watchlist.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{watchlist.description}</p>
              </div>
              <StatusBadge value={`${watchlist.alertCount} alerts`} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {watchlist.filters.countries?.map((item) => <StatusBadge key={item} value={item} />)}
              {watchlist.filters.eventTypes?.map((item) => <StatusBadge key={item} value={item} />)}
            </div>
          </article>
        ))}
      </section>
      <AlertList alerts={alerts} />
    </div>
  )
}

export function AlertList({ alerts }: { alerts: GeneratedAlert[] }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <h2 className="font-semibold">In-app alerts</h2>
      </div>
      <div className="mt-4 space-y-3">
        {alerts.slice(0, 12).map((alert) => (
          <article key={alert.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
            <div className="flex items-center gap-2">
              <StatusBadge value={alert.severity} />
              <span className="font-mono text-xs text-[var(--text-muted)]">{formatDate(alert.createdAt)}</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold">{alert.title}</h3>
            <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{alert.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function OperationsSummary({ sources, runs, events }: { sources: SourceHealth[]; runs: IngestionRunSummary[]; events: IntelligenceEvent[] }) {
  const failing = sources.filter((source) => source.freshnessStatus === "failing")
  const review = events.filter((event) => event.reviewStatus === "needs_review")
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <OpsCard icon={<RadioTower className="h-5 w-5" />} title="Source health" value={`${failing.length}/${sources.length}`} body="Failing sources over enabled monitored sources." href="/data-operations#sources" />
      <OpsCard icon={<FileSearch className="h-5 w-5" />} title="Review queue" value={review.length} body="Low-confidence or sensitive changes requiring analyst validation." href="/data-operations#review" />
      <OpsCard icon={<DatabaseZap className="h-5 w-5" />} title="Last run" value={runs[0]?.status ?? "none"} body={runs[0] ? `${runs[0].documentsCreated} document(s), ${runs[0].eventsCreated} event(s)` : "No ingestion run recorded."} href="/data-operations#runs" />
    </section>
  )
}

function OpsCard({ icon, title, value, body, href }: { icon: React.ReactNode; title: string; value: string | number; body: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--brand-primary)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface-subtle)]">{icon}</span>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">{title}</p>
      <p className="mt-1 font-mono text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{body}</p>
    </Link>
  )
}

export function SearchResults({
  query,
  countries,
  news,
  events,
  corridors,
  companies,
  regulation,
}: {
  query: string
  countries: CountryPaymentProfile[]
  news: NewsItem[]
  events: IntelligenceEvent[]
  corridors: InteroperabilityCorridor[]
  companies: CompanyProfile[]
  regulation: RegulatoryItem[]
}) {
  const needle = query.trim().toLowerCase()
  const countryResults = countries.filter((country) => contains([country.countryName, country.region, country.localSystems[0]?.name], needle)).slice(0, 8)
  const eventResults = events.filter((event) => contains([event.title, event.summary, event.eventType], needle)).slice(0, 8)
  const newsResults = news.filter((item) => contains([item.title, item.summary, item.category], needle)).slice(0, 8)
  const corridorResults = corridors.filter((corridor) => contains([corridor.sourceCountry, corridor.targetCountry, corridor.sourceSystem, corridor.targetSystem], needle)).slice(0, 8)
  const companyResults = companies.filter((company) => contains([company.name, company.type, ...company.markets], needle)).slice(0, 8)
  const regulationResults = regulation.filter((item) => contains([item.country, item.regulator, item.summary, item.topic], needle)).slice(0, 8)

  if (!needle) {
    return <EmptySearch />
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ResultPanel title="Markets" icon={<Target className="h-4 w-4" />} items={countryResults.map((country) => ({ href: `/countries/${country.slug}`, title: country.countryName, body: country.localSystems[0]?.name ?? country.region }))} />
      <ResultPanel title="Events" icon={<AlertTriangle className="h-4 w-4" />} items={eventResults.map((event) => ({ href: "/live", title: event.title, body: event.summary }))} />
      <ResultPanel title="News" icon={<FileSearch className="h-4 w-4" />} items={newsResults.map((item) => ({ href: "/live", title: item.title, body: item.summary }))} />
      <ResultPanel title="Corridors" icon={<Network className="h-4 w-4" />} items={corridorResults.map((corridor) => ({ href: "/interoperability", title: `${corridor.sourceCountry} to ${corridor.targetCountry}`, body: corridor.pspRelevance ?? corridor.status }))} />
      <ResultPanel title="Companies" icon={<Building2 className="h-4 w-4" />} items={companyResults.map((company) => ({ href: "/companies", title: company.name, body: company.markets.join(", ") }))} />
      <ResultPanel title="Regulation" icon={<Shield className="h-4 w-4" />} items={regulationResults.map((item) => ({ href: "/regulation", title: `${item.country}: ${item.topic}`, body: item.impact }))} />
    </div>
  )
}

function ResultPanel({ title, icon, items }: { title: string; icon: React.ReactNode; items: Array<{ href: string; title: string; body: string }> }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {items.length ? items.map((item) => (
          <Link key={`${item.href}-${item.title}`} href={item.href} className="block rounded-xl bg-[var(--surface-subtle)] px-3 py-2 hover:text-[var(--brand-primary)]">
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{item.body}</p>
          </Link>
        )) : <p className="text-sm text-[var(--text-muted)]">No matches.</p>}
      </div>
    </section>
  )
}

function EmptySearch() {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <FileSearch className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
      <h2 className="mt-4 text-lg font-semibold">Search stored intelligence</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Use the query parameter `?q=` to search markets, rails, corridors, companies, regulation, news and events.</p>
    </section>
  )
}

function contains(values: Array<string | undefined>, query: string) {
  return values.filter(Boolean).join(" ").toLowerCase().includes(query)
}
