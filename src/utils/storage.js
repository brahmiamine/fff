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

    // Discard stale saves if any saved question no longer exists in the current
    // question bank (content updated/removed). This must stay a subset check —
    // a saved run can cover any lot size (10, 20, all...), not just the full bank.
    const currentIds = new Set(questionsData.map((q) => q.id))
    const stillValid = parsed.quizQuestions.every((q) => currentIds.has(q.id))
    if (!stillValid) return null

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
