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
    <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5 transition hover:border-[var(--brand-primary)]", className)}>
      <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
      {detail && <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{detail}</p>}
    </div>
  )
}
