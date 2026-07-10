import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { RegulationTable } from "@/components/intelligence/panels"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function RegulationPage() {
  const snapshot = await getDashboardSnapshot()
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-4xl font-semibold tracking-tight">Regulation</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          Market-entry rules, digital asset treatment, payment-system status and effective-date changes with confidence and evidence.
        </p>
      </section>
      <RegulationTable items={snapshot.regulation} />
    </div>
  )
}
