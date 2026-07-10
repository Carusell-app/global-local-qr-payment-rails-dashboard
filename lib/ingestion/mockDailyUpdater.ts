import { runIngestion } from "@/lib/ingestion/pipeline"

export async function runMockDailyUpdate() {
  return runIngestion({ cadence: "general" })
}
