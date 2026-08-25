const SETTINGS_KEY = 'cda-quiz-settings-v1'
const QUESTION_COUNTS = new Set([10, 20, 30])
const MODES = new Set(['training', 'exam'])
const THEMES = new Set(['system', 'light', 'dark'])
const MIN_QUESTION_TIME_SECONDS = 10
const MAX_QUESTION_TIME_SECONDS = 300

export function defaultSettings() {
  return {
    defaultQuestionCount: 20,
    defaultMode: 'training',
    defaultTimed: false,
    questionTimeSeconds: 60,
    showExplanations: true,
    theme: 'system',
  }
}

export function normalizeQuestionTimeSeconds(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return defaultSettings().questionTimeSeconds
  const rounded = Math.round(numeric)
  if (rounded < MIN_QUESTION_TIME_SECONDS || rounded > MAX_QUESTION_TIME_SECONDS) {
    return defaultSettings().questionTimeSeconds
  }
  return rounded
}

export function normalizeSettings(value) {
  const defaults = defaultSettings()
  if (!value || typeof value !== 'object') return defaults

  const rawCount = value.defaultQuestionCount
  const numericCount = Number(rawCount)
  const defaultQuestionCount = rawCount === 'all'
    ? 'all'
    : QUESTION_COUNTS.has(numericCount) ? numericCount : defaults.defaultQuestionCount

  return {
    defaultQuestionCount,
    defaultMode: MODES.has(value.defaultMode) ? value.defaultMode : defaults.defaultMode,
    defaultTimed: typeof value.defaultTimed === 'boolean' ? value.defaultTimed : defaults.defaultTimed,
    questionTimeSeconds: normalizeQuestionTimeSeconds(value.questionTimeSeconds),
    showExplanations: typeof value.showExplanations === 'boolean' ? value.showExplanations : defaults.showExplanations,
    theme: THEMES.has(value.theme) ? value.theme : defaults.theme,
  }
}

export function resolveDefaultQuestionCount(preference, total) {
  if (!Number.isFinite(total) || total <= 0) return 0
  if (preference === 'all') return total
  const count = QUESTION_COUNTS.has(Number(preference)) ? Number(preference) : defaultSettings().defaultQuestionCount
  return Math.min(count, total)
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? normalizeSettings(JSON.parse(raw)) : defaultSettings()
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)))
  } catch {
    // The app remains usable when localStorage is unavailable.
  }
}

export function clearSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY)
  } catch {
    // ignore
  }
}
