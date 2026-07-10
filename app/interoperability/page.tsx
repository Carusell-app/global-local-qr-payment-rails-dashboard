import { InteroperabilityMatrix } from "@/components/interoperability-matrix"
import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function InteroperabilityPage() {
  const snapshot = await getDashboardSnapshot()
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Interoperability Matrix</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          Corridor-level view of national QR, instant payment and wallet network interoperability. Filters cover live, pilot, announced, planned and unclear corridors.
        </p>
      </section>
      <InteroperabilityMatrix countries={snapshot.countries} corridors={snapshot.corridors} />
    </div>
  )
}
