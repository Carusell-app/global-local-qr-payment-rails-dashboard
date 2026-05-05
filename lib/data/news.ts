import { getAllNews } from "@/lib/data/countries"

export const newsItems = getAllNews().sort((a, b) => b.date.localeCompare(a.date))

export function getNewsForCountry(countrySlug: string) {
  return newsItems.filter((item) => item.countrySlug === countrySlug)
}

export function getWeeklyNews() {
  return newsItems.slice(0, 18)
}
