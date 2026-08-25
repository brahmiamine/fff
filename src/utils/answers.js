export function isAnswerCorrect(question, selected = []) {
  const correct = [...question.correct].sort()
  const chosen = [...selected].sort()
  return correct.length === chosen.length && correct.every((id, i) => id === chosen[i])
}
