import assert from "node:assert/strict"
import test from "node:test"

function titleSimilarity(left, right) {
  const tokens = (value) => value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2)
  const a = new Set(tokens(left))
  const b = new Set(tokens(right))
  const intersection = Array.from(a).filter((token) => b.has(token)).length
  return intersection / Math.max(a.size, b.size)
}

test("title similarity groups near duplicate corridor announcements", () => {
  assert.ok(titleSimilarity("UPI PayNow corridor goes live for remittances", "PayNow UPI remittance corridor now live") >= 0.5)
})
