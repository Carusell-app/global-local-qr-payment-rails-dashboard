import type { Confidence } from "@/lib/types"
import { cn, humanize } from "@/lib/utils"
import { statusTone } from "@/lib/utils/status"

const toneClasses = {
  green: "bg-[#e6f9ec] text-[#22a34a]",
  amber: "bg-[#fffbe6] text-[#b08800]",
  red: "bg-[#fdecea] text-[#d32f2f]",
  blue: "bg-[#e8f0ff] text-[#2457a6]",
  slate: "bg-[#e8e8e8] text-[#666666]",
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
  return <span className="inline-flex rounded-lg bg-[#e8e8e8] px-2.5 py-1 text-xs font-medium text-[#666666]">Data requires verification</span>
}
