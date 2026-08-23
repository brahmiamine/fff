// Barème /100 : les points de chaque question sont répartis à parts égales.
// - Choix unique : tout ou rien.
// - Choix multiple : crédit partiel (bonnes coches - mauvaises coches) / nb de bonnes réponses, jamais négatif.
// - Question non répondue : 0 point (calcul naturel, aucune coche ne peut être "bonne").
export function computeScore(questions, answers) {
  const pointsPerQuestion = questions.length > 0 ? 100 / questions.length : 0

  let unanswered = 0

  const details = questions.map((q) => {
    const selected = answers[q.id] || []
    const isAnswered = selected.length > 0
    if (!isAnswered) unanswered += 1

    let earned
    if (q.type === 'single') {
      earned = isAnswered && q.correct.includes(selected[0]) ? pointsPerQuestion : 0
    } else {
      const correctCount = q.correct.length
      const correctSelected = selected.filter((id) => q.correct.includes(id)).length
      const incorrectSelected = selected.length - correctSelected
      const ratio = correctCount > 0 ? (correctSelected - incorrectSelected) / correctCount : 0
      earned = Math.max(0, ratio) * pointsPerQuestion
    }

    return { id: q.id, earned, max: pointsPerQuestion, answered: isAnswered }
  })

  const total = details.reduce((sum, d) => sum + d.earned, 0)

  return {
    total: Math.round(total * 10) / 10,
    unanswered,
    details,
  }
}
