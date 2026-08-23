const STORAGE_KEY = 'cda-quiz-progress-v1'

export function loadProgress(questionsData) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.quizQuestions) || parsed.quizQuestions.length === 0) {
      return null
    }
    if (!['home', 'quiz', 'results'].includes(parsed.screen)) return null
    if (
      typeof parsed.currentIndex !== 'number' ||
      parsed.currentIndex < 0 ||
      parsed.currentIndex >= parsed.quizQuestions.length
    ) {
      return null
    }
    if (typeof parsed.answers !== 'object' || parsed.answers === null) return null

    // Discard stale saves if the question bank changed since it was saved.
    const currentIds = questionsData.map((q) => q.id).sort().join(',')
    const savedIds = [...parsed.quizQuestions].map((q) => q.id).sort().join(',')
    if (currentIds !== savedIds) return null

    return parsed
  } catch {
    return null
  }
}

export function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private browsing, quota) — progress just won't persist.
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
