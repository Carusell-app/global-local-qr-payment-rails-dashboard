import { countries } from "@/lib/data/countries"
import { qrCountries } from "@/lib/data/qr-systems"

const flagByName = new Map<string, string>()
const labelByName = new Map<string, string>()

for (const country of countries) {
  if (country.flagEmoji) flagByName.set(country.countryName.toLowerCase(), country.flagEmoji)
  labelByName.set(country.countryName.toLowerCase(), country.countryName)
  flagByName.set(country.slug.toLowerCase(), country.flagEmoji ?? "🏳️")
  labelByName.set(country.slug.toLowerCase(), country.countryName)
}

for (const country of qrCountries) {
  flagByName.set(country.country.toLowerCase(), country.flag)
  labelByName.set(country.country.toLowerCase(), country.country)
  for (const alias of country.aliases) flagByName.set(alias.toLowerCase(), country.flag)
  for (const alias of country.aliases) labelByName.set(alias.toLowerCase(), country.country)
}

flagByName.set("uae", "🇦🇪")
labelByName.set("uae", "UAE")
flagByName.set("united arab emirates", "🇦🇪")
labelByName.set("united arab emirates", "United Arab Emirates")
flagByName.set("saudi arabia", "🇸🇦")
labelByName.set("saudi arabia", "Saudi Arabia")
flagByName.set("united states", "🇺🇸")
labelByName.set("united states", "United States")
flagByName.set("ghana", "🇬🇭")
labelByName.set("ghana", "Ghana")
flagByName.set("argentina", "🇦🇷")
labelByName.set("argentina", "Argentina")

export function countryFlag(name?: string) {
  if (!name) return "🏳️"
  const key = name.toLowerCase()
  return flagByName.get(key) ?? flagByName.get(key.replaceAll("-", " ")) ?? "🏳️"
}

export function countryWithFlag(name?: string) {
  if (!name) return "🏳️ Unknown"
  const key = name.toLowerCase()
  const label = labelByName.get(key) ?? labelByName.get(key.replaceAll("-", " ")) ?? name
  return `${countryFlag(name)} ${label}`
}
