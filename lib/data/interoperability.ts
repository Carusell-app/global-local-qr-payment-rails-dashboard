import { getAllCorridors } from "@/lib/data/countries"

export const corridors = getAllCorridors().sort((a, b) => {
  const order = { live: 0, pilot: 1, announced: 2, planned: 3, unclear: 4 }
  return order[a.status] - order[b.status]
})

export function getLiveCorridors() {
  return corridors.filter((corridor) => corridor.status === "live")
}
