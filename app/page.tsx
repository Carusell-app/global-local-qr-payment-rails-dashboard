import Link from "next/link"
import { ArrowRight, Bell, Network, Newspaper, Target } from "lucide-react"
import { WorldMap } from "@/components/world-map"
import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { AlertList, FreshnessGrid, OperationsSummary, OpportunityList } from "@/components/intelligence/panels"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot()
  const criticalEvents = snapshot.events.filter((event) => ["high", "medium"].includes(event.confidence)).slice(0, 4)

  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />

      <section className="grid gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div className="flex min-h-[360px] flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">Payment intelligence operating system</span>
              <span className="rounded-lg bg-[#fff8e6] px-2.5 py-1 text-xs font-medium text-[#8a6400]">Source-backed projections</span>
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1] tracking-tight lg:text-7xl">
              Global Local QR & Payment Rails Intelligence
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
              Monitor local QR payment systems, instant rails, interoperability corridors, regulation, source health and business-development signals from canonical events.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/live" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--brand-primary-hover)]">
              Open live intelligence <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/data-operations" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-medium transition hover:border-[var(--brand-primary)]">
              Data operations
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <OverviewLink href="/live" icon={<Newspaper className="h-5 w-5" />} label="New events" value={snapshot.events.length} />
          <OverviewLink href="/interoperability" icon={<Network className="h-5 w-5" />} label="Corridors" value={snapshot.corridors.length} />
          <OverviewLink href="/opportunities" icon={<Target className="h-5 w-5" />} label="Opportunity radar" value={snapshot.opportunities.length} />
          <OverviewLink href="/watchlists" icon={<Bell className="h-5 w-5" />} label="In-app alerts" value={snapshot.alerts.length} />
        </div>
      </section>

      <FreshnessGrid freshness={snapshot.freshness} />
      <OperationsSummary sources={snapshot.sources} runs={snapshot.ingestionRuns} events={snapshot.events} />

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">Opportunity radar</h2>
            <Link href="/opportunities" className="text-sm font-medium text-[var(--brand-primary)]">View all</Link>
          </div>
          <OpportunityList opportunities={snapshot.opportunities.slice(0, 4)} />
        </div>
        <AlertList alerts={snapshot.alerts} />
      </section>

      {criticalEvents.length > 0 && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-xl font-semibold tracking-tight">Critical changes</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {criticalEvents.map((event) => (
              <Link key={event.id} href="/live" className="rounded-xl bg-[var(--surface-subtle)] p-4 transition hover:text-[var(--brand-primary)]">
                <p className="font-medium">{event.title}</p>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">{event.commercialImpact}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <WorldMap />
    </div>
  )
}

function OverviewLink({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: number }) {
  return (
    <Link href={href} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5 transition hover:border-[var(--brand-primary)]">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface)] text-[var(--brand-primary)]">{icon}</span>
      <p className="mt-5 text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 font-mono text-4xl font-semibold">{value}</p>
    </Link>
  )
}
