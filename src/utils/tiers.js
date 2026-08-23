// Builds up to 3 "lots" of question counts to offer before starting a quiz,
// e.g. 30 questions -> [10, 20, 30] ; 70 questions -> [20, 50, 70].
export function computeCountTiers(total) {
  if (total <= 0) return []

  const roundTo = total <= 20 ? 5 : 10
  const roundNice = (x) => Math.max(roundTo, Math.round(x / roundTo) * roundTo)

  const tier1 = Math.min(roundNice(total / 3), total)
  let tier2 = Math.min(roundNice((total * 2) / 3), total)
  if (tier2 <= tier1) tier2 = Math.min(tier1 + roundTo, total)

  return [...new Set([tier1, tier2, total])]
    .filter((v) => v > 0 && v <= total)
    .sort((a, b) => a - b)
}
