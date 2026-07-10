import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { OpportunityList } from "@/components/intelligence/panels"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function OpportunitiesPage() {
  const snapshot = await getDashboardSnapshot()
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-4xl font-semibold tracking-tight">Opportunities</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          Explainable market and corridor opportunity scores with component weights, blockers, counterparties and next actions.
        </p>
      </section>
      <OpportunityList opportunities={snapshot.opportunities} />
    </div>
  )
}
