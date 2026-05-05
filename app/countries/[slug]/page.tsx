import { notFound } from "next/navigation"
import { countries, getCountryBySlug } from "@/lib/data/countries"
import { CountryHero, CountryReport } from "@/components/country/country-report"

export function generateStaticParams() {
  return countries.map((country) => ({ slug: country.slug }))
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const country = getCountryBySlug(slug)
  if (!country) notFound()

  return (
    <div className="space-y-6">
      <CountryHero country={country} />
      <CountryReport country={country} />
    </div>
  )
}
