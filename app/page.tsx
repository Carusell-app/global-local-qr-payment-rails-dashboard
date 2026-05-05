import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MetricCard } from "@/components/ui/metric-card"
import { WorldMap } from "@/components/world-map"
import { qrCountries } from "@/lib/data/qr-systems"

export default function HomePage() {
  const systemsCount = qrCountries.reduce((sum, country) => sum + country.systems.length, 0)
  const activeSystems = qrCountries.reduce((sum, country) => sum + country.systems.filter((system) => system.status === "Active").length, 0)
  const pspCount = new Set(qrCountries.flatMap((country) => country.systems.flatMap((system) => system.pspProviders))).size
  const regionsCount = new Set(qrCountries.map((country) => country.region)).size

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="flex min-h-[420px] flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-[#e8e8e8] px-2.5 py-1 text-xs font-medium text-[#666]">QR payment systems dataset</span>
              <span className="rounded-lg bg-[#e8e8e8] px-2.5 py-1 text-xs font-medium text-[#666]">Globe.gl map</span>
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-tight text-zinc-950 lg:text-7xl">
              Global Local QR & Payment Rails Intelligence
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
              Track national QR systems, domestic payment rails, cross-border interoperability, PSP access, merchant coverage, regulation and crypto status across every country.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#world-map" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-5 py-3 text-sm font-medium text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.07)] transition hover:bg-[#eeeeee]">
              Explore world map <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/countries" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-5 py-3 text-sm font-medium text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.07)] transition hover:bg-[#eeeeee]">
              View country reports
            </Link>
            <Link href="/interoperability" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-5 py-3 text-sm font-medium text-[#111] shadow-[0_1px_4px_rgba(0,0,0,0.07)] transition hover:bg-[#eeeeee]">
              Open interoperability matrix
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="Countries tracked" value={qrCountries.length} detail="Countries and regional payment systems in the QR dataset" />
          <MetricCard label="Systems listed" value={systemsCount} detail="National QR, wallet and account-to-account payment systems" />
          <MetricCard label="Active systems" value={activeSystems} detail="Systems marked active in the current dataset" />
          <MetricCard label="PSP providers" value={pspCount} detail="Unique PSP, bank, wallet and scheme providers listed" />
          <MetricCard label="Regions covered" value={regionsCount} detail="Asia, Middle East, Latin America, Africa, Europe and CIS" className="sm:col-span-2" />
        </div>
      </section>

      <WorldMap />
    </div>
  )
}
