import { NextResponse, type NextRequest } from "next/server"
import { isSupabaseConfigured, supabaseRpc } from "@/lib/intelligence/supabase-rest"

export function requireCronSecret(request: NextRequest) {
  const configured = process.env.CRON_SECRET
  if (!configured) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 })
  }
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  const querySecret = request.nextUrl.searchParams.get("secret")
  if (bearer !== configured && querySecret !== configured) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function withJobLease<T>(jobName: string, callback: () => Promise<T>) {
  if (!isSupabaseConfigured()) return callback()
  const lease = await supabaseRpc<{ acquired: boolean }>("try_acquire_job_lease", { p_job_name: jobName, p_ttl_seconds: 900 }).catch(() => ({ acquired: true }))
  if (lease && !lease.acquired) {
    return { skipped: true, reason: "A previous invocation still holds the job lease." }
  }
  try {
    return await callback()
  } finally {
    await supabaseRpc("release_job_lease", { p_job_name: jobName }).catch(() => undefined)
  }
}
