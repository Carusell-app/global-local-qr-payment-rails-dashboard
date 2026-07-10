import { NextResponse, type NextRequest } from "next/server"
import { requireCronSecret, withJobLease } from "@/lib/ingestion/cron"
import { runIngestion } from "@/lib/ingestion/pipeline"

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  const unauthorized = requireCronSecret(request)
  if (unauthorized) return unauthorized
  const days = Number(request.nextUrl.searchParams.get("days") ?? "90")
  const result = await withJobLease(`backfill:${days}`, () => runIngestion({ cadence: "all", backfillDays: days }))
  return NextResponse.json(result)
}
