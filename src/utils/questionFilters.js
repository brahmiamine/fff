export const DEFAULT_QUESTION_FILTERS = Object.freeze({
  query: '',
  law: 'all',
  difficulty: 'all',
  category: 'all',
  media: 'all',
  validation: 'all',
})

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr-FR')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function questionSearchText(question) {
  return normalizeText([
    question.question,
    question.category,
    question.subcategory,
    question.law,
    question.difficulty,
    question.explanation,
    question.takeaway,
    ...(Array.isArray(question.tags) ? question.tags : []),
    ...(Array.isArray(question.options) ? question.options.map((option) => option.text) : []),
  ].filter(Boolean).join(' '))
}

export function filterQuestionList(questions, filters = {}, validatedIds = []) {
  const active = { ...DEFAULT_QUESTION_FILTERS, ...filters }
  const validated = new Set(validatedIds)
  const query = normalizeText(active.query)

  return questions.filter((question) => {
    if (query && !questionSearchText(question).includes(query)) return false
    if (active.law !== 'all' && question.law !== active.law) return false
    if (active.difficulty !== 'all' && question.difficulty !== active.difficulty) return false
    if (active.category !== 'all' && question.category !== active.category) return false
    if (active.media === 'image' && !question.image) return false
    if (active.media === 'video' && !question.video) return false
    if (active.validation === 'validated' && !validated.has(question.id)) return false
    if (active.validation === 'unvalidated' && validated.has(question.id)) return false
    return true
  })
}

export function getQuestionFilterOptions(questions) {
  const unique = (key) => [...new Set(questions.map((question) => question[key]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), 'fr', { numeric: true }))

  return {
    laws: unique('law'),
    difficulties: unique('difficulty'),
    categories: unique('category'),
  }
}

export function selectUnvalidatedQuestions(questions, validatedIds = [], memorizedIds = null) {
  const validated = new Set(validatedIds)
  const memorized = memorizedIds == null ? null : new Set(memorizedIds)

  return questions.filter((question) => (
    !validated.has(question.id) && (!memorized || !memorized.has(question.id))
  ))
}
