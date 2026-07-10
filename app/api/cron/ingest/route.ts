import { NextResponse, type NextRequest } from "next/server"
import { requireCronSecret, withJobLease } from "@/lib/ingestion/cron"
import { runIngestion } from "@/lib/ingestion/pipeline"

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  const unauthorized = requireCronSecret(request)
  if (unauthorized) return unauthorized

  const sourceId = request.nextUrl.searchParams.get("sourceId") ?? undefined
  const cadence = (request.nextUrl.searchParams.get("cadence") ?? "general") as "priority" | "general" | "discovery" | "all"
  const result = await withJobLease(`ingest:${sourceId ?? cadence}`, () => runIngestion({ sourceId, cadence }))
  return NextResponse.json(result)
}
