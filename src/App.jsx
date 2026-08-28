import { useEffect, useMemo, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import AnswerKey from './components/AnswerKey.jsx'
import History from './components/History.jsx'
import BottomNav from './components/BottomNav.jsx'
import ReviewsHub from './components/ReviewsHub.jsx'
import FavoriteQuestions from './components/FavoriteQuestions.jsx'
import MistakeQuestions from './components/MistakeQuestions.jsx'
import Settings from './components/Settings.jsx'
import UnvalidatedQuestions from './components/UnvalidatedQuestions.jsx'
import Documents from './components/Documents.jsx'
import { prepareQuestions, shuffle } from './utils/shuffle.js'
import { loadProgress, saveProgress, clearProgress } from './utils/storage.js'
import { loadHistory, addHistoryEntry, clearHistory } from './utils/history.js'
import { computeScore } from './utils/scoring.js'
import { isAnswerCorrect } from './utils/answers.js'
import { enrichQuestions } from './utils/questionMetadata.js'
import { selectUnvalidatedQuestions } from './utils/questionFilters.js'
import { normalizeSavedSession, pauseTimedState, resumeTimedState } from './utils/session.js'
import {
  clearLearningState,
  computeLearningSummary,
  emptyLearningState,
  loadLearningState,
  markQuestionsValidated,
  recordQuizAttempts,
  recordValidatedAttempt,
  saveLearningState,
  selectAdaptiveQuestions,
  selectFavoriteQuestions,
  selectMistakeQuestions,
  selectWeakQuestions,
  toggleFavorite,
} from './utils/learning.js'
import {
  clearSettings,
  defaultSettings,
  loadSettings,
  normalizeSettings,
  resolveDefaultQuestionCount,
  saveSettings,
} from './utils/settings.js'

const PASS_THRESHOLD = 0.8

function isQuestionEnabled(question) {
  return !/^Règlement DLR\b/i.test(question.category || '')
}

const QUESTION_MODULES = import.meta.glob('./data/questions-lot*.json', {
  eager: true,
  import: 'default',
})

const QUESTION_LOTS = Object.entries(QUESTION_MODULES)
  .map(([path, questions]) => {
    const match = path.match(/questions-(lot\d+)\.json$/)
    if (!match) return null
    const id = match[1]
    const number = Number(id.replace('lot', ''))
    return {
      id,
      label: `Lot ${Number.isFinite(number) ? number : id.replace('lot', '')}`,
      questions: enrichQuestions((Array.isArray(questions) ? questions : []).filter(isQuestionEnabled)),
    }
  })
  .filter(Boolean)
  .sort((a, b) => Number(a.id.replace('lot', '')) - Number(b.id.replace('lot', '')))

const QUESTION_LOT_OPTIONS = QUESTION_LOTS.map(({ id, label }) => ({ id, label }))
const QUESTIONS_BY_LOT = Object.fromEntries(QUESTION_LOTS.map(({ id, questions }) => [id, questions]))
const LOT_IDS = QUESTION_LOTS.map(({ id }) => id)
const FALLBACK_LOT = LOT_IDS[0] || 'lot1'

function questionsForLot(lot) {
  return QUESTIONS_BY_LOT[lot] || QUESTIONS_BY_LOT[FALLBACK_LOT] || []
}

function loadAvailableSettings() {
  const settings = loadSettings()
  return QUESTIONS_BY_LOT[settings.questionLot]
    ? settings
    : { ...settings, questionLot: FALLBACK_LOT }
}

const NAV_SCREENS = new Set([
  'home',
  'reviews',
  'favorites',
  'mistakes',
  'unvalidated',
  'documents',
  'settings',
  'statistics',
  'answers',
])
const STATIC_SCREENS = new Set(NAV_SCREENS)
const LAST_SCREEN_KEY = 'cda-paris-quiz:last-screen'

function freshState() {
  return {
    screen: 'home',
    quizQuestions: [],
    answers: {},
    currentIndex: 0,
    timeLimitSeconds: null,
    deadlineAt: null,
    remainingSeconds: null,
    mode: 'training',
    preset: 'custom',
  }
}

function loadLastScreen() {
  try {
    return window.sessionStorage.getItem(LAST_SCREEN_KEY)
  } catch {
    return null
  }
}

function restoreLastScreen(baseState) {
  const lastScreen = loadLastScreen()
  if (STATIC_SCREENS.has(lastScreen)) return { ...baseState, screen: lastScreen }
  if (['quiz', 'results'].includes(lastScreen) && baseState.quizQuestions.length > 0) {
    return { ...baseState, screen: lastScreen }
  }
  return baseState
}

function initialStateForLot(lot) {
  const questions = questionsForLot(lot)
  const saved = loadProgress(questions, lot)
  if (!saved) return restoreLastScreen(freshState())
  const hydrated = {
    ...freshState(),
    ...saved,
    quizQuestions: enrichQuestions(saved.quizQuestions || []),
    mode: saved.mode || 'training',
    preset: saved.preset || 'custom',
  }
  const normalized = normalizeSavedSession(hydrated) || freshState()
  return restoreLastScreen(normalized)
}

function prepareSelectedQuestions(pool, learning, count, preset) {
  const size = Math.min(Math.max(count || pool.length, 1), pool.length)
  let selected

  if (preset === 'adaptive') selected = selectAdaptiveQuestions(pool, learning, size)
  else if (preset === 'weak') selected = selectWeakQuestions(pool, learning, size)
  else if (preset === 'mistakes') selected = selectMistakeQuestions(pool, learning, size)
  else if (preset === 'favorites') selected = selectFavoriteQuestions(pool, learning, size)
  else return prepareQuestions(pool).slice(0, size)

  return prepareQuestions(selected)
}

export default function App() {
  const [settings, setSettings] = useState(loadAvailableSettings)
  const activeLot = settings.questionLot
  const QUESTIONS = questionsForLot(activeLot)
  const [state, setState] = useState(() => initialStateForLot(loadAvailableSettings().questionLot))
  const [history, setHistory] = useState(() => loadHistory(loadAvailableSettings().questionLot))
  const [learning, setLearning] = useState(() => loadLearningState(loadAvailableSettings().questionLot))

  const learningSummary = useMemo(() => computeLearningSummary(QUESTIONS, learning), [QUESTIONS, learning])
  const unvalidatedEligibleTotal = useMemo(
    () => selectUnvalidatedQuestions(QUESTIONS, learning.validated).length,
    [QUESTIONS, learning.validated],
  )
  const unvalidatedQuizCount = resolveDefaultQuestionCount(settings.defaultQuestionCount, unvalidatedEligibleTotal)
  const mistakeCount = learningSummary.mistakeCount

  useEffect(() => {
    try {
      window.sessionStorage.setItem(LAST_SCREEN_KEY, state.screen)
    } catch {
      // Le stockage peut être indisponible en navigation privée ; la navigation continue normalement.
    }
  }, [state.screen])

  useEffect(() => {
    if (state.quizQuestions.length > 0 && ['home', 'quiz', 'results'].includes(state.screen)) {
      saveProgress(state, activeLot)
    }
  }, [state, activeLot])

  useEffect(() => {
    saveLearningState(learning, activeLot)
  }, [learning, activeLot])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.animations = settings.animationsEnabled ? 'on' : 'off'
  }, [settings.animationsEnabled])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')

    function applyTheme() {
      const resolved = settings.theme === 'system'
        ? media?.matches ? 'dark' : 'light'
        : settings.theme
      root.dataset.theme = resolved
      root.style.colorScheme = resolved
    }

    applyTheme()
    if (settings.theme !== 'system' || !media) return undefined

    if (media.addEventListener) media.addEventListener('change', applyTheme)
    else media.addListener?.(applyTheme)

    return () => {
      if (media.removeEventListener) media.removeEventListener('change', applyTheme)
      else media.removeListener?.(applyTheme)
    }
  }, [settings.theme])

  function startQuiz({ count, category = 'all', timeLimitSeconds = null, mode = 'training', preset = 'custom' }) {
    let pool = category !== 'all' ? QUESTIONS.filter((q) => q.category === category) : QUESTIONS
    if (preset === 'unvalidated') {
      pool = selectUnvalidatedQuestions(pool, learning.validated)
    }
    const quizQuestions = prepareSelectedQuestions(pool, learning, count, preset)
    if (quizQuestions.length === 0) {
      window.alert('Aucune question disponible pour cette sélection.')
      return
    }

    const limit = timeLimitSeconds || null
    setState({
      screen: 'quiz',
      quizQuestions,
      answers: {},
      currentIndex: 0,
      timeLimitSeconds: limit,
      deadlineAt: limit ? Date.now() + limit * 1000 : null,
      remainingSeconds: limit,
      mode,
      preset,
    })
  }

  function startUnvalidatedQuiz() {
    if (unvalidatedQuizCount === 0) return
    const timeLimitSeconds = settings.defaultTimed
      ? unvalidatedQuizCount * settings.questionTimeSeconds
      : null

    startQuiz({
      count: unvalidatedQuizCount,
      mode: settings.defaultMode,
      preset: 'unvalidated',
      timeLimitSeconds,
    })
  }

  function reviewMistakes() {
    const wrong = state.quizQuestions.filter((q) => !isAnswerCorrect(q, state.answers[q.id] || []))
    if (wrong.length === 0) return
    setState({
      screen: 'quiz',
      quizQuestions: shuffle(wrong).map((q) => ({ ...q, options: shuffle(q.options) })),
      answers: {},
      currentIndex: 0,
      timeLimitSeconds: null,
      deadlineAt: null,
      remainingSeconds: null,
      mode: 'training',
      preset: 'mistakes',
    })
  }

  function resumeQuiz() {
    if (state.quizQuestions.length === 0) {
      clearProgress(activeLot)
      setState(freshState())
      return
    }

    setState((current) => ({
      ...resumeTimedState(current),
      screen: 'quiz',
    }))
  }

  function finishQuiz(finalAnswers) {
    const score = computeScore(state.quizQuestions, finalAnswers)
    const goodCount = state.quizQuestions.filter((q) => isAnswerCorrect(q, finalAnswers[q.id] || [])).length

    const categoryStats = {}
    state.quizQuestions.forEach((q) => {
      if (!categoryStats[q.category]) categoryStats[q.category] = { correct: 0, total: 0 }
      categoryStats[q.category].total += 1
      if (isAnswerCorrect(q, finalAnswers[q.id] || [])) categoryStats[q.category].correct += 1
    })

    addHistoryEntry({
      date: new Date().toISOString(),
      scoreTotal: score.total,
      total: state.quizQuestions.length,
      goodCount,
      unanswered: score.unanswered,
      categoryStats,
      mode: state.mode,
      preset: state.preset,
      lot: activeLot,
    }, activeLot)
    setHistory(loadHistory(activeLot))

    // En entraînement, chaque réponse est enregistrée dès l'appui sur « Valider ».
    // En examen, il n'y a pas de validation intermédiaire : on enregistre tout à la fin.
    if (state.mode === 'exam') {
      setLearning((current) => {
        const attempted = recordQuizAttempts(current, state.quizQuestions, finalAnswers)
        const answeredIds = state.quizQuestions
          .filter((question) => (finalAnswers[question.id] || []).length > 0)
          .map((question) => question.id)
        return markQuestionsValidated(attempted, answeredIds)
      })
    }

    setState((current) => ({
      ...current,
      screen: 'results',
      answers: finalAnswers,
      deadlineAt: null,
    }))
  }

  function pauseQuiz() {
    setState((current) => ({ ...pauseTimedState(current), screen: 'home' }))
  }

  function resetProgress() {
    clearProgress(activeLot)
    setState(freshState())
  }

  function setCurrentIndex(updater) {
    setState((current) => ({
      ...current,
      currentIndex: typeof updater === 'function' ? updater(current.currentIndex) : updater,
    }))
  }

  function setAnswers(nextAnswers) {
    setState((current) => ({ ...current, answers: nextAnswers }))
  }

  function navigateTo(screen) {
    setState((current) => ({ ...current, screen }))
  }

  function handleClearHistory() {
    clearHistory(activeLot)
    setHistory([])
  }

  function handleResetLearning() {
    clearLearningState(activeLot)
    setLearning(emptyLearningState())
  }

  function handleToggleFavorite(questionId) {
    setLearning((current) => toggleFavorite(current, questionId))
  }

  function handleQuestionValidated(question, selectedAnswer) {
    setLearning((current) => recordValidatedAttempt(current, question, selectedAnswer))
  }

  function handleSettingsChange(patch) {
    let next = normalizeSettings({ ...settings, ...patch })
    if (!QUESTIONS_BY_LOT[next.questionLot]) next = { ...next, questionLot: FALLBACK_LOT }

    if (next.questionLot !== activeLot) {
      const nextLot = next.questionLot
      setHistory(loadHistory(nextLot))
      setLearning(loadLearningState(nextLot))
      setState(initialStateForLot(nextLot))
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    setSettings(next)
  }

  function handleResetAllData() {
    LOT_IDS.forEach((lot) => {
      clearProgress(lot)
      clearHistory(lot)
      clearLearningState(lot)
    })
    clearSettings()
    const defaults = defaultSettings()
    const nextSettings = QUESTIONS_BY_LOT[defaults.questionLot]
      ? defaults
      : { ...defaults, questionLot: FALLBACK_LOT }
    setHistory([])
    setLearning(emptyLearningState())
    setSettings(nextSettings)
    setState(freshState())
  }

  const resumable = state.quizQuestions.length > 0 && state.screen === 'home'
  const showBottomNav = NAV_SCREENS.has(state.screen)

  return (
    <div className={`app-shell ${showBottomNav ? 'has-bottom-nav' : ''}`}>
      {state.screen === 'home' && (
        <Home
          allQuestions={QUESTIONS}
          onStart={startQuiz}
          resumable={resumable}
          resumeIndex={state.currentIndex}
          resumeTotal={state.quizQuestions.length}
          resumeMode={state.mode}
          onResume={resumeQuiz}
          onReset={resetProgress}
          settings={settings}
        />
      )}
      {state.screen === 'quiz' && (
        <Quiz
          questions={state.quizQuestions}
          currentIndex={state.currentIndex}
          setCurrentIndex={setCurrentIndex}
          answers={state.answers}
          setAnswers={setAnswers}
          timeLimitSeconds={state.timeLimitSeconds}
          deadlineAt={state.deadlineAt}
          remainingSeconds={state.remainingSeconds}
          mode={state.mode}
          onFinish={finishQuiz}
          onAbort={pauseQuiz}
          onReset={resetProgress}
          onValidate={handleQuestionValidated}
          favoriteIds={learning.favorites}
          onToggleFavorite={handleToggleFavorite}
          showExplanations={settings.showExplanations}
          animationsEnabled={settings.animationsEnabled}
          soundsEnabled={settings.soundsEnabled}
        />
      )}
      {state.screen === 'results' && (
        <Results
          questions={state.quizQuestions}
          answers={state.answers}
          passThreshold={PASS_THRESHOLD}
          mode={state.mode}
          onRestart={resetProgress}
          onReviewMistakes={reviewMistakes}
          showExplanations={settings.showExplanations}
          animationsEnabled={settings.animationsEnabled}
          soundsEnabled={settings.soundsEnabled}
        />
      )}
      {state.screen === 'answers' && (
        <AnswerKey
          questions={QUESTIONS}
          validatedIds={learning.validated}
          onBack={() => navigateTo('settings')}
          showExplanations={settings.showExplanations}
        />
      )}
      {state.screen === 'statistics' && (
        <History
          history={history}
          learningSummary={learningSummary}
          onClear={handleClearHistory}
          onResetLearning={handleResetLearning}
        />
      )}
      {state.screen === 'reviews' && (
        <ReviewsHub
          favoriteCount={learning.favorites.length}
          mistakeCount={mistakeCount}
          neverValidatedCount={learningSummary.neverValidatedCount}
          onOpenFavorites={() => navigateTo('favorites')}
          onOpenMistakes={() => navigateTo('mistakes')}
          onOpenUnvalidated={() => navigateTo('unvalidated')}
        />
      )}
      {state.screen === 'unvalidated' && (
        <UnvalidatedQuestions
          questions={QUESTIONS}
          validatedIds={learning.validated}
          quizCount={unvalidatedQuizCount}
          onStart={startUnvalidatedQuiz}
          onBack={() => navigateTo('reviews')}
        />
      )}
      {state.screen === 'documents' && <Documents />}
      {state.screen === 'settings' && (
        <Settings
          settings={settings}
          questionLots={QUESTION_LOT_OPTIONS}
          onChange={handleSettingsChange}
          onViewQuestions={() => navigateTo('answers')}
          onResetAll={handleResetAllData}
        />
      )}
      {state.screen === 'favorites' && (
        <FavoriteQuestions
          questions={QUESTIONS}
          favoriteIds={learning.favorites}
          onToggleFavorite={handleToggleFavorite}
          onStart={startQuiz}
          onBack={() => navigateTo('reviews')}
        />
      )}
      {state.screen === 'mistakes' && (
        <MistakeQuestions
          questions={QUESTIONS}
          learningSummary={learningSummary}
          onStart={startQuiz}
          onBack={() => navigateTo('reviews')}
        />
      )}
      {showBottomNav && <BottomNav activeScreen={state.screen} onNavigate={navigateTo} />}
    </div>
  )
}
