import type { Confidence } from "@/lib/types"
import { cn, humanize } from "@/lib/utils"
import { statusTone } from "@/lib/utils/status"

const toneClasses = {
  green: "bg-[#e6f9f0] text-[#007a4c]",
  amber: "bg-[#fff8e6] text-[#8a6400]",
  red: "bg-[#fde8e9] text-[#b31620]",
  blue: "bg-[#e8f2fd] text-[#145ea8]",
  slate: "bg-[var(--surface-subtle)] text-[var(--text-secondary)]",
}

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = statusTone(value)
  return (
    <span className={cn("inline-flex w-fit items-center rounded-lg px-2.5 py-1 text-xs font-medium", toneClasses[tone], className)}>
      {humanize(value)}
    </span>
  )
}

export function ConfidenceBadge({ value }: { value: Confidence }) {
  return <StatusBadge value={`${value} confidence`} />
}

export function SeedBadge() {
  return <span className="inline-flex rounded-lg bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">Legacy seed requires verification</span>
}
