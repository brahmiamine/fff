import { isAnswerCorrect } from './answers.js'

const LEARNING_KEY = 'cda-quiz-learning-v1'

function scopedLearningKey(lot = 'lot1') {
  return `${LEARNING_KEY}:${lot}`
}

export function emptyLearningState() {
  return { version: 1, favorites: [], memorized: [], validated: [], questions: {} }
}

function normalizeIdList(value) {
  return Array.isArray(value) ? [...new Set(value.filter(Boolean))] : []
}

function migrateValidatedIds(value, questions) {
  if (Array.isArray(value.validated)) return normalizeIdList(value.validated)
  return Object.entries(questions)
    .filter(([, stat]) => Number(stat?.seenCount || 0) > 0)
    .map(([questionId]) => questionId)
}

export function normalizeLearningState(value) {
  if (!value || typeof value !== 'object') return emptyLearningState()
  const questions = value.questions && typeof value.questions === 'object' ? value.questions : {}
  return {
    version: 1,
    favorites: normalizeIdList(value.favorites),
    memorized: normalizeIdList(value.memorized),
    validated: migrateValidatedIds(value, questions),
    questions,
  }
}

export function loadLearningState(lot = 'lot1') {
  try {
    const scopedKey = scopedLearningKey(lot)
    let raw = localStorage.getItem(scopedKey)

    // Migration de l'ancien état d'apprentissage vers le lot 1.
    if (!raw && lot === 'lot1') {
      const legacy = localStorage.getItem(LEARNING_KEY)
      if (legacy) {
        raw = legacy
        localStorage.setItem(scopedKey, legacy)
        localStorage.removeItem(LEARNING_KEY)
      }
    }

    return raw ? normalizeLearningState(JSON.parse(raw)) : emptyLearningState()
  } catch {
    return emptyLearningState()
  }
}

export function saveLearningState(state, lot = 'lot1') {
  try {
    localStorage.setItem(scopedLearningKey(lot), JSON.stringify(normalizeLearningState(state)))
  } catch {
    // Offline/private mode can disable localStorage. The app still works for the current session.
  }
}

export function clearLearningState(lot = 'lot1') {
  try {
    localStorage.removeItem(scopedLearningKey(lot))
    if (lot === 'lot1') localStorage.removeItem(LEARNING_KEY)
  } catch {
    // ignore
  }
}

export function toggleFavorite(state, questionId) {
  const current = normalizeLearningState(state)
  const favorites = new Set(current.favorites)
  if (favorites.has(questionId)) favorites.delete(questionId)
  else favorites.add(questionId)
  return { ...current, favorites: [...favorites] }
}

export function toggleMemorized(state, questionId) {
  const current = normalizeLearningState(state)
  const memorized = new Set(current.memorized)
  if (memorized.has(questionId)) memorized.delete(questionId)
  else memorized.add(questionId)
  return { ...current, memorized: [...memorized] }
}

export function markQuestionsValidated(state, questionIds) {
  const current = normalizeLearningState(state)
  const validated = new Set(current.validated)
  const ids = Array.isArray(questionIds) ? questionIds : [questionIds]
  ids.filter(Boolean).forEach((questionId) => validated.add(questionId))
  return { ...current, validated: [...validated] }
}

export function excludeMemorizedQuestions(questions, state) {
  const memorized = new Set(normalizeLearningState(state).memorized)
  return questions.filter((question) => !memorized.has(question.id))
}

export function recordQuizAttempts(state, questions, answers, now = Date.now()) {
  const current = normalizeLearningState(state)
  const nextQuestions = { ...current.questions }

  questions.forEach((question) => {
    const previous = nextQuestions[question.id] || {}
    const correct = isAnswerCorrect(question, answers[question.id] || [])
    const seenCount = (previous.seenCount || 0) + 1
    const correctCount = (previous.correctCount || 0) + (correct ? 1 : 0)
    const wrongCount = (previous.wrongCount || 0) + (correct ? 0 : 1)

    nextQuestions[question.id] = {
      seenCount,
      correctCount,
      wrongCount,
      lastSeen: new Date(now).toISOString(),
      lastResult: correct,
      mastery: seenCount ? correctCount / seenCount : 0,
    }
  })

  return { ...current, questions: nextQuestions }
}

function statFor(state, questionId) {
  return normalizeLearningState(state).questions[questionId] || null
}

function priorityFor(question, state) {
  const stat = statFor(state, question.id)
  if (!stat) return 80
  const mastery = Number.isFinite(stat.mastery) ? stat.mastery : 0
  return (stat.lastResult === false ? 45 : 0) + (1 - mastery) * 45 + Math.max(0, 10 - (stat.seenCount || 0))
}

function takeTop(questions, count, score) {
  return [...questions]
    .map((question, index) => ({ question, index, score: score(question) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.min(count, questions.length))
    .map((item) => item.question)
}

export function selectAdaptiveQuestions(questions, state, count) {
  return takeTop(questions, count, (question) => priorityFor(question, state))
}

export function selectWeakQuestions(questions, state, count) {
  return takeTop(questions, count, (question) => {
    const stat = statFor(state, question.id)
    if (!stat) return 40
    return (1 - (stat.mastery || 0)) * 100 + (stat.lastResult === false ? 20 : 0)
  })
}

export function selectMistakeQuestions(questions, state, count) {
  const filtered = questions.filter((question) => statFor(state, question.id)?.lastResult === false)
  return takeTop(filtered, count, (question) => {
    const stat = statFor(state, question.id)
    return (stat.wrongCount || 0) * 10 + (1 - (stat.mastery || 0)) * 30
  })
}

export function selectFavoriteQuestions(questions, state, count) {
  const favorites = new Set(normalizeLearningState(state).favorites)
  return questions.filter((question) => favorites.has(question.id)).slice(0, count)
}

export function computeLearningSummary(questions, state) {
  const current = normalizeLearningState(state)
  const memorized = new Set(current.memorized)
  const knownQuestionIds = new Set(questions.map((question) => question.id))
  const validated = new Set(current.validated.filter((questionId) => knownQuestionIds.has(questionId)))
  const perQuestion = questions.map((question) => {
    const stat = current.questions[question.id] || {}
    return {
      id: question.id,
      category: question.category,
      question: question.question,
      validated: validated.has(question.id),
      seenCount: stat.seenCount || 0,
      correctCount: stat.correctCount || 0,
      wrongCount: stat.wrongCount || 0,
      mastery: stat.mastery || 0,
      lastResult: stat.lastResult,
      lastSeen: stat.lastSeen || null,
    }
  })

  const categoryMap = new Map()
  perQuestion.forEach((item) => {
    if (!categoryMap.has(item.category)) categoryMap.set(item.category, { category: item.category, seen: 0, correct: 0 })
    const bucket = categoryMap.get(item.category)
    bucket.seen += item.seenCount
    bucket.correct += item.correctCount
  })

  const categories = [...categoryMap.values()]
    .map((item) => ({ ...item, rate: item.seen ? item.correct / item.seen : 0 }))
    .sort((a, b) => a.rate - b.rate)

  const seenQuestions = perQuestion.filter((item) => item.seenCount > 0)
  const mistakeCount = perQuestion.filter((item) => item.lastResult === false && !memorized.has(item.id)).length

  return {
    totalQuestions: questions.length,
    seenQuestions: seenQuestions.length,
    validatedQuestions: validated.size,
    neverValidatedCount: Math.max(0, questions.length - validated.size),
    masteredQuestions: seenQuestions.filter((item) => item.mastery >= 0.8 && item.seenCount >= 2).length,
    mistakeCount,
    favoriteCount: current.favorites.length,
    memorizedCount: current.memorized.length,
    categories,
    perQuestion,
  }
}
