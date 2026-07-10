import { Database, TriangleAlert } from "lucide-react"
import type { DashboardSnapshot } from "@/lib/intelligence/types"
import { formatDate } from "@/lib/utils"

export function DataModeBanner({ snapshot }: { snapshot: DashboardSnapshot }) {
  const live = snapshot.dataMode === "database"
  return (
    <section className={`rounded-2xl border px-4 py-3 text-sm ${live ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {live ? <Database className="mt-0.5 h-4 w-4" /> : <TriangleAlert className="mt-0.5 h-4 w-4" />}
          <p>
            {live
              ? `Database projections active. Last sync: ${snapshot.freshness.lastSuccessfulSync ? formatDate(snapshot.freshness.lastSuccessfulSync) : "not recorded"}.`
              : "Legacy seed fallback is active. Configure Supabase and run ingestion before using this as verified current intelligence."}
          </p>
        </div>
        <p className="font-mono text-xs">
          {snapshot.freshness.sourceCount} sources / {snapshot.freshness.pendingReviews} review item(s)
        </p>
      </div>
    </section>
  )
}
