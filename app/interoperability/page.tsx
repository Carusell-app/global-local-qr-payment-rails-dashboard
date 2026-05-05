import { countries } from "@/lib/data/countries"
import { corridors } from "@/lib/data/interoperability"
import { InteroperabilityMatrix } from "@/components/interoperability-matrix"
import { SeedBadge } from "@/components/ui/status-badge"

export default function InteroperabilityPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6">
        <SeedBadge />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Interoperability Matrix</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-600">
          Corridor-level view of national QR, instant payment and wallet network interoperability. Filters cover live, pilot, announced, planned and unclear corridors.
        </p>
      </section>
      <InteroperabilityMatrix countries={countries} corridors={corridors} />
    </div>
  )
}
