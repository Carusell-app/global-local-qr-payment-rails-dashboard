import { NextResponse, type NextRequest } from "next/server"
import { requireCronSecret, withJobLease } from "@/lib/ingestion/cron"
import { runIngestion } from "@/lib/ingestion/pipeline"

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  const unauthorized = requireCronSecret(request)
  if (unauthorized) return unauthorized
  const result = await withJobLease("nightly-reconciliation", () => runIngestion({ cadence: "all" }))
  return NextResponse.json(result)
}
