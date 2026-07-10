import { CompanyDirectory } from "@/components/intelligence/panels"
import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function CompaniesPage() {
  const snapshot = await getDashboardSnapshot()
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-4xl font-semibold tracking-tight">Companies</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          PSPs, banks, wallets, acquirers, processors and schemes derived from participant records and structured events.
        </p>
      </section>
      <CompanyDirectory companies={snapshot.companies} />
    </div>
  )
}
