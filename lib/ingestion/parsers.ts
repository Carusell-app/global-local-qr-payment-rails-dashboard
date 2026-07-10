import { createHash } from "node:crypto"
import type { ParserResult, RawDocumentInput, SourceRegistryRecord } from "@/lib/ingestion/sourceTypes"

export async function parseFeedOrArticle(source: SourceRegistryRecord, body: string, contentType: string): Promise<ParserResult> {
  try {
    if (contentType.includes("json") || source.ingestionMethod === "json_feed" || source.ingestionMethod === "rest_api") {
      return { documents: parseJsonFeed(source, body), errors: [] }
    }
    if (body.includes("<rss") || body.includes("<rdf:RDF") || body.includes("<item")) {
      return { documents: parseRss(source, body), errors: [] }
    }
    if (body.includes("<feed") || body.includes("<entry")) {
      return { documents: parseAtom(source, body), errors: [] }
    }
    if (body.includes("<urlset") && body.includes("<loc>")) {
      return { documents: parseSitemap(source, body), errors: [] }
    }
    return { documents: [parseHtml(source, body, source.url)], errors: [] }
  } catch (error) {
    return { documents: [], errors: [{ sourceId: source.id, message: error instanceof Error ? error.message : "Unknown parser error", url: source.url }] }
  }
}

function parseJsonFeed(source: SourceRegistryRecord, body: string): RawDocumentInput[] {
  const parsed = JSON.parse(body) as {
    title?: string
    items?: Array<Record<string, unknown>>
    data?: Array<Record<string, unknown>>
    results?: Array<Record<string, unknown>>
  }
  const items = parsed.items ?? parsed.data ?? parsed.results ?? []
  return items.slice(0, 50).map((item, index) => {
    const title = String(item.title ?? item.name ?? `${parsed.title ?? source.name} item ${index + 1}`)
    const url = String(item.url ?? item.external_url ?? item.link ?? source.url)
    const text = String(item.content_text ?? item.summary ?? item.description ?? item.content_html ?? title)
    return rawDocument(source, {
      url,
      title,
      publisher: source.name,
      publishedAt: stringOrUndefined(item.date_published ?? item.published_at ?? item.pubDate),
      updatedAt: stringOrUndefined(item.date_modified ?? item.updated_at),
      excerpt: stripHtml(text).slice(0, 420),
      cleanText: stripHtml(text),
      rawSnapshot: JSON.stringify(item).slice(0, 12000),
      rawContentType: "application/json",
    })
  })
}

function parseRss(source: SourceRegistryRecord, body: string): RawDocumentInput[] {
  return blocks(body, "item").slice(0, 50).map((item) => {
    const title = readTag(item, "title") || source.name
    const url = readTag(item, "link") || readTag(item, "guid") || source.url
    const text = readTag(item, "description") || readTag(item, "content:encoded") || title
    return rawDocument(source, {
      url,
      title,
      publisher: readTag(body, "title") || source.name,
      author: readTag(item, "author") || readTag(item, "dc:creator"),
      publishedAt: normalizeDate(readTag(item, "pubDate") || readTag(item, "dc:date")),
      updatedAt: normalizeDate(readTag(item, "updated")),
      excerpt: stripHtml(text).slice(0, 420),
      cleanText: stripHtml(text),
      rawSnapshot: item.slice(0, 12000),
      rawContentType: "application/rss+xml",
    })
  })
}

function parseAtom(source: SourceRegistryRecord, body: string): RawDocumentInput[] {
  return blocks(body, "entry").slice(0, 50).map((entry) => {
    const title = readTag(entry, "title") || source.name
    const href = entry.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1]
    const text = readTag(entry, "summary") || readTag(entry, "content") || title
    return rawDocument(source, {
      url: href || readTag(entry, "id") || source.url,
      title,
      publisher: readTag(body, "title") || source.name,
      author: readTag(blocks(entry, "author")[0] ?? "", "name"),
      publishedAt: normalizeDate(readTag(entry, "published")),
      updatedAt: normalizeDate(readTag(entry, "updated")),
      excerpt: stripHtml(text).slice(0, 420),
      cleanText: stripHtml(text),
      rawSnapshot: entry.slice(0, 12000),
      rawContentType: "application/atom+xml",
    })
  })
}

function parseSitemap(source: SourceRegistryRecord, body: string): RawDocumentInput[] {
  return blocks(body, "url").slice(0, 80).map((entry) => {
    const url = readTag(entry, "loc") || source.url
    const lastModified = normalizeDate(readTag(entry, "lastmod"))
    return rawDocument(source, {
      url,
      title: `Sitemap candidate: ${new URL(url).pathname}`,
      publisher: source.name,
      updatedAt: lastModified,
      excerpt: "Discovered via XML sitemap; queued for article-level fetch or analyst review.",
      cleanText: "Discovered via XML sitemap; queued for article-level fetch or analyst review.",
      rawSnapshot: entry.slice(0, 4000),
      rawContentType: "application/xml",
    })
  })
}

function parseHtml(source: SourceRegistryRecord, body: string, url: string): RawDocumentInput {
  const jsonLd = extractJsonLd(body)
  const title = stringOrUndefined(jsonLd?.headline) ?? meta(body, "og:title") ?? tagText(body, "title") ?? source.name
  const excerpt = stringOrUndefined(jsonLd?.description) ?? meta(body, "og:description") ?? meta(body, "description") ?? ""
  const cleanText = stripHtml(extractArticleHtml(body) || body).slice(0, 12000)
  return rawDocument(source, {
    url: stringOrUndefined(jsonLd?.url) ?? meta(body, "og:url") ?? url,
    title,
    publisher: nestedName(jsonLd?.publisher) ?? meta(body, "og:site_name") ?? source.name,
    author: nestedName(jsonLd?.author),
    publishedAt: normalizeDate(stringOrUndefined(jsonLd?.datePublished) ?? meta(body, "article:published_time")),
    updatedAt: normalizeDate(stringOrUndefined(jsonLd?.dateModified) ?? meta(body, "article:modified_time")),
    excerpt: stripHtml(excerpt).slice(0, 420),
    cleanText,
    rawSnapshot: body.slice(0, 12000),
    rawContentType: "text/html",
  })
}

function rawDocument(
  source: SourceRegistryRecord,
  input: {
    url: string
    title: string
    publisher: string
    author?: string
    publishedAt?: string
    updatedAt?: string
    excerpt?: string
    cleanText: string
    rawSnapshot?: string
    rawContentType?: string
  },
): RawDocumentInput {
  const canonicalUrl = canonicalizeUrl(input.url, source.url)
  const normalizedUrl = normalizeUrl(canonicalUrl)
  const contentHash = hash(`${input.title}\n${input.cleanText}`)
  return {
    id: `doc_${hash(`${source.id}:${normalizedUrl}:${contentHash}`).slice(0, 24)}`,
    sourceId: source.id,
    canonicalUrl,
    normalizedUrl,
    title: decodeEntities(input.title).trim(),
    publisher: decodeEntities(input.publisher).trim(),
    author: input.author ? decodeEntities(input.author).trim() : undefined,
    publishedAt: input.publishedAt,
    updatedAt: input.updatedAt,
    language: source.languages[0],
    excerpt: input.excerpt ? decodeEntities(input.excerpt).trim() : undefined,
    cleanText: decodeEntities(input.cleanText).replace(/\s+/g, " ").trim(),
    contentHash,
    rawSnapshot: input.rawSnapshot,
    rawContentType: input.rawContentType,
    sourceTrustTier: source.trustTier,
    originalCountry: source.countriesCovered[0],
  }
}

function blocks(xml: string, tag: string) {
  return Array.from(xml.matchAll(new RegExp(`<${escapeRegex(tag)}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${escapeRegex(tag)}>`, "gi"))).map((match) => match[0])
}

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${escapeRegex(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapeRegex(tag)}>`, "i"))
  return match ? decodeEntities(match[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim()) : undefined
}

function tagText(html: string, tag: string) {
  return readTag(html, tag)
}

function meta(html: string, key: string) {
  const escaped = escapeRegex(key)
  return html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"))?.[1]
}

function extractJsonLd(html: string): Record<string, Record<string, string> | string> | undefined {
  const blocks = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)).map((match) => match[1])
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(decodeEntities(block.trim())) as unknown
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      const article = candidates.find((candidate) => {
        const value = candidate as { "@type"?: string | string[] }
        return Array.isArray(value["@type"]) ? value["@type"].includes("NewsArticle") : ["NewsArticle", "Article", "Report"].includes(value["@type"] ?? "")
      })
      if (article && typeof article === "object") return article as Record<string, Record<string, string> | string>
    } catch {
      // Ignore malformed structured data from the page.
    }
  }
}

function extractArticleHtml(html: string) {
  return html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html.match(/<main[\s\S]*?<\/main>/i)?.[0]
}

export function stripHtml(value: string) {
  return decodeEntities(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

function canonicalizeUrl(value: string, fallback: string) {
  try {
    return new URL(value, fallback).toString()
  } catch {
    return fallback
  }
}

export function normalizeUrl(value: string) {
  const url = new URL(value)
  url.hash = ""
  ;["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key))
  url.searchParams.sort()
  return url.toString().replace(/\/$/, "")
}

function normalizeDate(value?: string) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function nestedName(value: unknown) {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name
    return typeof name === "string" ? name : undefined
  }
}

export function hash(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
