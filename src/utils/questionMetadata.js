const DEFAULT_SOURCE = 'CDA District 75 — test théorique corrigé'
const DEFAULT_SEASON = '2026/2027'

export function inferLaw(question) {
  const text = `${question.category || ''} ${question.question || ''}`.toLowerCase()
  if (text.includes('hors-jeu') || text.includes('hors jeu')) return 'Loi 11'
  if (text.includes('penalty')) return 'Loi 14'
  if (text.includes('équipement')) return 'Loi 4'
  if (text.includes('autres officiels')) return 'Loi 6'
  if (text.includes('terrain de jeu')) return 'Loi 1'
  if (text.includes('rentrée de touche')) return 'Loi 15'
  if (text.includes('coup de pied de but')) return 'Loi 16'
  if (text.includes('coup de pied de coin') || text.includes('corner')) return 'Loi 17'
  if (text.includes('coup franc')) return 'Loi 13'
  if (text.includes('coup d’envoi') || text.includes("coup d'envoi") || text.includes('ballon à terre')) return 'Loi 8'
  if (text.includes('les joueurs')) return 'Loi 3'
  if (text.includes('faute') || text.includes('avantage')) return 'Lois 5 et 12'
  return null
}

function firstSentence(text) {
  if (!text) return null
  const match = text.match(/^(.+?[.!?])(?:\s|$)/)
  return (match?.[1] || text).trim()
}

export function enrichQuestion(question) {
  const joined = `${question.category || ''} ${question.question || ''}`
  return {
    ...question,
    subcategory: question.subcategory ?? null,
    law: question.law ?? inferLaw(question),
    difficulty: question.difficulty || 'standard',
    source: question.source || DEFAULT_SOURCE,
    season: question.season || DEFAULT_SEASON,
    districtSpecific:
      question.districtSpecific ?? /district|ligue|règlement de compétition/i.test(joined),
    tags: Array.isArray(question.tags) ? question.tags : [],
    takeaway: question.takeaway || firstSentence(question.explanation),
  }
}

export function enrichQuestions(questions) {
  return questions.map(enrichQuestion)
}
