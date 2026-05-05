import { cn } from "@/lib/utils"

export function MetricCard({
  label,
  value,
  detail,
  className,
}: {
  label: string
  value: string | number
  detail?: string
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl bg-[#f5f5f5] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.07)] transition hover:bg-[#eeeeee]", className)}>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-zinc-950">{value}</p>
      {detail && <p className="mt-2 text-sm leading-5 text-zinc-500">{detail}</p>}
    </div>
  )
}
