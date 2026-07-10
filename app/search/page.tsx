import { SearchResults } from "@/components/intelligence/panels"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q }, snapshot] = await Promise.all([searchParams, getDashboardSnapshot()])
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-4xl font-semibold tracking-tight">Search</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          Global search across markets, rails, corridors, companies, regulators, news and structured events.
        </p>
        <form action="/search" className="mt-5 flex max-w-2xl gap-2">
          <input name="q" defaultValue={q ?? ""} className="focus-ring min-h-11 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-4 text-sm" placeholder="Search ASEAN QR, PayNet, regulation, corridor status" />
          <button className="focus-ring min-h-11 rounded-full bg-[var(--brand-primary)] px-5 text-sm font-medium text-white" type="submit">Search</button>
        </form>
      </section>
      <SearchResults
        query={q ?? ""}
        countries={snapshot.countries}
        news={snapshot.news}
        events={snapshot.events}
        corridors={snapshot.corridors}
        companies={snapshot.companies}
        regulation={snapshot.regulation}
      />
    </div>
  )
}
