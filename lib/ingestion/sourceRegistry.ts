import sourceRegistrySeed from "@/data/source-registry.json"
import type { SourceRegistryRecord } from "@/lib/intelligence/types"

export const sourceRegistry = sourceRegistrySeed as SourceRegistryRecord[]

export function getSeedSourceById(sourceId: string) {
  return sourceRegistry.find((source) => source.id === sourceId)
}

export function getSeedSourcesForCadence(kind: "priority" | "general" | "discovery" | "all" = "all") {
  if (kind === "priority") return sourceRegistry.filter((source) => source.enabled && source.trustTier === 1)
  if (kind === "general") return sourceRegistry.filter((source) => source.enabled && source.trustTier <= 3)
  if (kind === "discovery") return sourceRegistry.filter((source) => source.enabled && source.trustTier === 4)
  return sourceRegistry.filter((source) => source.enabled)
}
