"use client"

import { useState } from "react"
import type { NewsItem } from "@/lib/types"
import { ConfidenceBadge, StatusBadge } from "@/components/ui/status-badge"
import { formatDate } from "@/lib/utils"
import { countryWithFlag } from "@/lib/utils/country-flags"

export function GlobalNews({ news }: { news: NewsItem[] }) {
  const [topic, setTopic] = useState("all")
  const topics = Array.from(new Set(news.map((item) => item.category))).sort()
  const filtered = news.filter((item) => topic === "all" || item.category === topic)
  const alerts = news.filter((item) => ["regulation", "crypto", "fraud_risk"].includes(item.category)).slice(0, 6)
  const corridors = news.filter((item) => item.category === "interoperability").slice(0, 6)

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel title="What changed this week" items={news.slice(0, 6)} />
        <Panel title="Regulatory alerts" items={alerts} />
        <Panel title="New cross-border corridors" items={corridors} />
      </section>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Latest updates across countries</h2>
            <p className="mt-1 text-sm text-zinc-500">Research feed generated from the current payment systems dataset.</p>
          </div>
          <select className="focus-ring rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm" value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="all">all topics</option>
            {topics.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div className="mt-5 space-y-3">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={item.category} />
                <StatusBadge value={item.sourceType} />
                <ConfidenceBadge value={item.confidence} />
                <span className="font-mono text-xs text-zinc-500">{formatDate(item.date)}</span>
              </div>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs font-medium text-zinc-500">{countryWithFlag(item.countrySlug)}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{item.summary}</p>
              <p className="mt-2 text-sm text-zinc-700"><span className="font-medium">PSP impact:</span> {item.whyItMattersForPsps}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function Panel({ title, items }: { title: string; items: NewsItem[] }) {
  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5">
      <h2 className="font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <StatusBadge value={item.category} />
            <p className="mt-2 text-xs font-medium text-zinc-500">{countryWithFlag(item.countrySlug)}</p>
            <p className="mt-2 text-sm font-medium leading-5">{item.title}</p>
            <p className="mt-1 font-mono text-xs text-zinc-500">{formatDate(item.date)}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
