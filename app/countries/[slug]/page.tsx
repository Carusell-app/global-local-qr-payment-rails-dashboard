import { notFound } from "next/navigation"
import { CountryHero, CountryReport } from "@/components/country/country-report"
import { getCountryBySlug, getCountrySlugs } from "@/lib/intelligence/repository"

export async function generateStaticParams() {
  const slugs = await getCountrySlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const country = await getCountryBySlug(slug)
  if (!country) notFound()

  return (
    <div className="space-y-6">
      <CountryHero country={country} />
      <CountryReport country={country} />
    </div>
  )
}
