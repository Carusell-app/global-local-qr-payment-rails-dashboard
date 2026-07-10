import { AlertTriangle } from "lucide-react"
import { DataModeBanner } from "@/components/intelligence/data-mode-banner"
import { EventFeed, OperationsSummary, SourceHealthTable } from "@/components/intelligence/panels"
import { StatusBadge } from "@/components/ui/status-badge"
import { getDashboardSnapshot } from "@/lib/intelligence/repository"
import { formatDate } from "@/lib/utils"

export default async function DataOperationsPage() {
  const snapshot = await getDashboardSnapshot()
  const reviewEvents = snapshot.events.filter((event) => event.reviewStatus === "needs_review" || event.reviewStatus === "conflict")
  return (
    <div className="space-y-6">
      <DataModeBanner snapshot={snapshot} />
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-4xl font-semibold tracking-tight">Data Operations</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
          Source health, ingestion runs, parsing errors, stale sources, review queue and low-confidence changes.
        </p>
      </section>
      <OperationsSummary sources={snapshot.sources} runs={snapshot.ingestionRuns} events={snapshot.events} />
      <section id="sources" className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Source health</h2>
        <SourceHealthTable sources={snapshot.sources} />
      </section>
      <section id="runs" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-xl font-semibold tracking-tight">Ingestion runs</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.ingestionRuns.map((run) => (
            <article key={run.id} className="rounded-xl bg-[var(--surface-subtle)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={run.status} />
                <StatusBadge value={run.jobType} />
                <span className="font-mono text-xs text-[var(--text-muted)]">{formatDate(run.startedAt)}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {run.documentsFetched} fetched / {run.documentsCreated} new / {run.duplicates} duplicate / {run.eventsCreated} events / {run.errors} errors
              </p>
            </article>
          ))}
        </div>
      </section>
      <section id="review" className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
          <h2 className="text-xl font-semibold tracking-tight">Review queue</h2>
        </div>
        <EventFeed events={reviewEvents} />
      </section>
    </div>
  )
}
