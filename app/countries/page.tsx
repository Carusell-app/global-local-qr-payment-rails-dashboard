import { CountryTable } from "@/components/country/country-table"
import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function CountriesPage() {
  const snapshot = await getDashboardSnapshot()
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Country Intelligence Database</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          Search, filter and sort local QR systems, instant payment rails, crypto status, PSP access paths, merchant coverage and data confidence.
        </p>
      </section>
      <CountryTable countries={snapshot.countries} />
    </div>
  )
}
