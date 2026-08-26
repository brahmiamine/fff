import { useEffect, useMemo, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import AnswerKey from './components/AnswerKey.jsx'
import History from './components/History.jsx'
import BottomNav from './components/BottomNav.jsx'
import MemorizedQuestions from './components/MemorizedQuestions.jsx'
import FavoriteQuestions from './components/FavoriteQuestions.jsx'
import MistakeQuestions from './components/MistakeQuestions.jsx'
import Settings from './components/Settings.jsx'
import UnvalidatedQuestions from './components/UnvalidatedQuestions.jsx'
import questionsData from './data/questions.json'
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
  excludeMemorizedQuestions,
  loadLearningState,
  markQuestionsValidated,
  recordQuizAttempts,
  saveLearningState,
  selectAdaptiveQuestions,
  selectFavoriteQuestions,
  selectMistakeQuestions,
  selectWeakQuestions,
  toggleFavorite,
  toggleMemorized,
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
const QUESTIONS = enrichQuestions(questionsData)
const NAV_SCREENS = new Set(['home', 'memorized', 'favorites', 'mistakes', 'settings', 'statistics', 'unvalidated'])

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

function initialState() {
  const saved = loadProgress(QUESTIONS)
  if (!saved) return freshState()
  const hydrated = {
    ...freshState(),
    ...saved,
    quizQuestions: enrichQuestions(saved.quizQuestions || []),
    mode: saved.mode || 'training',
    preset: saved.preset || 'custom',
  }
  return normalizeSavedSession(hydrated) || freshState()
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
  const [state, setState] = useState(initialState)
  const [history, setHistory] = useState(() => loadHistory())
  const [learning, setLearning] = useState(() => loadLearningState())
  const [settings, setSettings] = useState(() => loadSettings())

  const learningSummary = useMemo(() => computeLearningSummary(QUESTIONS, learning), [learning])
  const unvalidatedEligibleTotal = useMemo(
    () => selectUnvalidatedQuestions(QUESTIONS, learning.validated, learning.memorized).length,
    [learning.validated, learning.memorized],
  )
  const unvalidatedQuizCount = resolveDefaultQuestionCount(settings.defaultQuestionCount, unvalidatedEligibleTotal)

  useEffect(() => {
    if (state.quizQuestions.length > 0 && ['home', 'quiz', 'results'].includes(state.screen)) {
      saveProgress(state)
    }
  }, [state])

  useEffect(() => {
    saveLearningState(learning)
  }, [learning])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

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
    else media.addListener?.('change', applyTheme)

    return () => {
      if (media.removeEventListener) media.removeEventListener('change', applyTheme)
      else media.removeListener?.('change', applyTheme)
    }
  }, [settings.theme])

  function startQuiz({ count, category = 'all', timeLimitSeconds = null, mode = 'training', preset = 'custom' }) {
    let categoryPool = category !== 'all' ? QUESTIONS.filter((q) => q.category === category) : QUESTIONS
    if (preset === 'unvalidated') {
      categoryPool = selectUnvalidatedQuestions(categoryPool, learning.validated)
    }
    const pool = excludeMemorizedQuestions(categoryPool, learning)
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
    const eligibleWrong = excludeMemorizedQuestions(wrong, learning)
    if (eligibleWrong.length === 0) return
    setState({
      screen: 'quiz',
      quizQuestions: shuffle(eligibleWrong).map((q) => ({ ...q, options: shuffle(q.options) })),
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
    const eligibleQuestions = excludeMemorizedQuestions(state.quizQuestions, learning)
    if (eligibleQuestions.length === 0) {
      clearProgress()
      setState(freshState())
      return
    }

    const currentQuestionId = state.quizQuestions[state.currentIndex]?.id
    const matchingIndex = eligibleQuestions.findIndex((question) => question.id === currentQuestionId)
    const nextIndex = matchingIndex >= 0 ? matchingIndex : Math.min(state.currentIndex, eligibleQuestions.length - 1)

    setState((current) => ({
      ...resumeTimedState(current),
      screen: 'quiz',
      quizQuestions: eligibleQuestions,
      currentIndex: nextIndex,
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
    })
    setHistory(loadHistory())
    setLearning((current) => {
      const attempted = recordQuizAttempts(current, state.quizQuestions, finalAnswers)
      if (state.mode !== 'exam') return attempted
      const answeredIds = state.quizQuestions
        .filter((question) => (finalAnswers[question.id] || []).length > 0)
        .map((question) => question.id)
      return markQuestionsValidated(attempted, answeredIds)
    })

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
    clearProgress()
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

  function backToHome() {
    navigateTo('home')
  }

  function handleClearHistory() {
    clearHistory()
    setHistory([])
  }

  function handleResetLearning() {
    clearLearningState()
    setLearning(emptyLearningState())
  }

  function handleToggleFavorite(questionId) {
    setLearning((current) => toggleFavorite(current, questionId))
  }

  function handleToggleMemorized(questionId) {
    setLearning((current) => toggleMemorized(current, questionId))
  }

  function handleQuestionValidated(questionId) {
    setLearning((current) => markQuestionsValidated(current, questionId))
  }

  function handleSettingsChange(patch) {
    setSettings((current) => normalizeSettings({ ...current, ...patch }))
  }

  function handleResetAllData() {
    clearProgress()
    clearHistory()
    clearLearningState()
    clearSettings()
    setHistory([])
    setLearning(emptyLearningState())
    setSettings(defaultSettings())
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
          onViewAnswers={() => navigateTo('answers')}
          learningSummary={learningSummary}
          memorizedIds={learning.memorized}
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
          memorizedIds={learning.memorized}
          onToggleMemorized={handleToggleMemorized}
          showExplanations={settings.showExplanations}
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
        />
      )}
      {state.screen === 'answers' && (
        <AnswerKey
          questions={QUESTIONS}
          validatedIds={learning.validated}
          onBack={backToHome}
          showExplanations={settings.showExplanations}
        />
      )}
      {state.screen === 'statistics' && (
        <History
          history={history}
          learningSummary={learningSummary}
          onBack={() => navigateTo('settings')}
          onClear={handleClearHistory}
          onResetLearning={handleResetLearning}
        />
      )}
      {state.screen === 'unvalidated' && (
        <UnvalidatedQuestions
          questions={QUESTIONS}
          validatedIds={learning.validated}
          memorizedIds={learning.memorized}
          quizCount={unvalidatedQuizCount}
          onStart={startUnvalidatedQuiz}
          onBack={() => navigateTo('settings')}
        />
      )}
      {state.screen === 'settings' && (
        <Settings
          settings={settings}
          onChange={handleSettingsChange}
          onViewStatistics={() => navigateTo('statistics')}
          onViewUnvalidated={() => navigateTo('unvalidated')}
          onResetAll={handleResetAllData}
          historyCount={history.length}
          learningSummary={learningSummary}
        />
      )}
      {state.screen === 'memorized' && (
        <MemorizedQuestions
          questions={QUESTIONS}
          memorizedIds={learning.memorized}
          onToggleMemorized={handleToggleMemorized}
          showExplanations={settings.showExplanations}
        />
      )}
      {state.screen === 'favorites' && (
        <FavoriteQuestions
          questions={QUESTIONS}
          favoriteIds={learning.favorites}
          memorizedIds={learning.memorized}
          onToggleFavorite={handleToggleFavorite}
          onStart={startQuiz}
        />
      )}
      {state.screen === 'mistakes' && (
        <MistakeQuestions
          questions={QUESTIONS}
          learningSummary={learningSummary}
          memorizedIds={learning.memorized}
          onStart={startQuiz}
        />
      )}
      {showBottomNav && <BottomNav activeScreen={state.screen} onNavigate={navigateTo} />}
    </div>
  )
}
