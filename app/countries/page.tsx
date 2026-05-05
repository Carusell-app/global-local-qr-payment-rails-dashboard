import { countries } from "@/lib/data/countries"
import { CountryTable } from "@/components/country/country-table"
import { SeedBadge } from "@/components/ui/status-badge"

export default function CountriesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6">
        <SeedBadge />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Country Intelligence Database</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
          Search, filter and sort local QR systems, instant payment rails, crypto status, PSP access paths, merchant coverage and data confidence.
        </p>
      </section>
      <CountryTable countries={countries} />
    </div>
  )
}
