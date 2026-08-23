export function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickQuestions(questions, { category, count }) {
  const filtered = category && category !== 'all'
    ? questions.filter((q) => q.category === category)
    : questions
  const shuffled = shuffle(filtered)
  const size = count === 'all' ? shuffled.length : Math.min(count, shuffled.length)
  return shuffled.slice(0, size).map((q) => ({ ...q, options: shuffle(q.options) }))
}
