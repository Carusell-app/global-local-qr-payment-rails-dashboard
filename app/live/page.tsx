import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { EventFeed, NewsCards } from "@/components/intelligence/panels"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"

export default async function LiveIntelligencePage() {
  const snapshot = await getDashboardSnapshot()
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-4xl font-semibold tracking-tight">Live Intelligence</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          Clustered source-backed stories, structured intelligence events, material changes, business impact and recommended BD actions.
        </p>
      </section>
      <EventFeed events={snapshot.events} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Published story feed</h2>
        <NewsCards news={snapshot.news} />
      </section>
    </div>
  )
}
