import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { WatchlistCards } from "@/components/intelligence/panels"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function WatchlistsPage() {
  const snapshot = await getDashboardSnapshot()
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-4xl font-semibold tracking-tight">Watchlists</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          In-app watchlists for countries, rails, companies, corridors, event types and keywords. Alert generation is deduplicated by event/story cluster.
        </p>
      </section>
      <WatchlistCards watchlists={snapshot.watchlists} alerts={snapshot.alerts} />
    </div>
  )
}
