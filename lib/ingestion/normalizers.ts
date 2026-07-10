import type { NormalizedDocument, RawDocumentInput, SourceRegistryRecord } from "@/lib/ingestion/sourceTypes"

const railKeywords: Record<string, string[]> = {
  UPI: ["upi", "unified payments interface"],
  Pix: ["pix"],
  QRIS: ["qris"],
  PromptPay: ["promptpay", "prompt pay"],
  PayNow: ["paynow"],
  DuitNow: ["duitnow"],
  "QR Ph": ["qr ph", "qrph"],
  VietQR: ["vietqr"],
  Aani: ["aani"],
  CoDi: ["codi"],
  NQR: ["nqr"],
  PayShap: ["payshap"],
  Wero: ["wero", "epi"],
}

const companySuffixPattern = /\b([A-Z][A-Za-z0-9&.\-]+(?:\s+[A-Z][A-Za-z0-9&.\-]+){0,3})\s+(?:Bank|Payments|Pay|Wallet|Group|Network|Corporation|Corp|Inc|Ltd|PLC|PSP|Fintech)\b/g

export function normalizeDocument(document: RawDocumentInput, source: SourceRegistryRecord): NormalizedDocument {
  const haystack = `${document.title} ${document.excerpt ?? ""} ${document.cleanText}`.toLowerCase()
  const paymentRails = Object.entries(railKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([rail]) => rail)

  const companies = Array.from(`${document.title} ${document.excerpt ?? ""}`.matchAll(companySuffixPattern))
    .map((match) => match[0].trim())
    .slice(0, 8)

  const regulators = source.sourceType === "central_bank" || source.sourceType === "regulator" ? [source.name] : []

  return {
    ...document,
    documentType: source.sourceType === "central_bank" || source.sourceType === "regulator" ? "regulator_publication" : document.rawContentType?.includes("json") ? "json_feed_item" : "article",
    affectedCountries: source.countriesCovered,
    paymentRails,
    companies,
    regulators,
    currencies: extractCurrencies(document.cleanText),
    topics: source.topics,
  }
}

function extractCurrencies(text: string) {
  const matches = text.match(/\b[A-Z]{3}\b/g) ?? []
  return Array.from(new Set(matches.filter((value) => ["USD", "EUR", "INR", "BRL", "IDR", "THB", "MYR", "SGD", "PHP", "VND", "AED", "SAR", "MXN", "NGN", "ZAR"].includes(value)))).slice(0, 8)
}
