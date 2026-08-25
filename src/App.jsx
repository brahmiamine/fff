import { useEffect, useMemo, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import AnswerKey from './components/AnswerKey.jsx'
import History from './components/History.jsx'
import BottomNav from './components/BottomNav.jsx'
import Terrain from './components/Terrain.jsx'
import questionsData from './data/questions.json'
import { prepareQuestions, shuffle } from './utils/shuffle.js'
import { loadProgress, saveProgress, clearProgress } from './utils/storage.js'
import { loadHistory, addHistoryEntry, clearHistory } from './utils/history.js'
import { computeScore } from './utils/scoring.js'
import { isAnswerCorrect } from './utils/answers.js'
import { enrichQuestions } from './utils/questionMetadata.js'
import { normalizeSavedSession, pauseTimedState, resumeTimedState } from './utils/session.js'
import {
  clearLearningState,
  computeLearningSummary,
  emptyLearningState,
  loadLearningState,
  recordQuizAttempts,
  saveLearningState,
  selectAdaptiveQuestions,
  selectFavoriteQuestions,
  selectMistakeQuestions,
  selectWeakQuestions,
  toggleFavorite,
} from './utils/learning.js'

const PASS_THRESHOLD = 0.8
const QUESTIONS = enrichQuestions(questionsData)
const NAV_SCREENS = new Set(['home', 'history', 'answers', 'terrain'])

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

  const learningSummary = useMemo(() => computeLearningSummary(QUESTIONS, learning), [learning])

  useEffect(() => {
    if (state.quizQuestions.length > 0 && ['home', 'quiz', 'results'].includes(state.screen)) {
      saveProgress(state)
    }
  }, [state])

  useEffect(() => {
    saveLearningState(learning)
  }, [learning])

  function startQuiz({ count, category = 'all', timeLimitSeconds = null, mode = 'training', preset = 'custom' }) {
    const pool = category !== 'all' ? QUESTIONS.filter((q) => q.category === category) : QUESTIONS
    const quizQuestions = prepareSelectedQuestions(pool, learning, count, preset)
    if (quizQuestions.length === 0) return

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
    setState((current) => ({ ...resumeTimedState(current), screen: 'quiz' }))
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
    setLearning((current) => recordQuizAttempts(current, state.quizQuestions, finalAnswers))

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

  function viewAnswers() {
    navigateTo('answers')
  }

  function viewHistory() {
    navigateTo('history')
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
          learningSummary={learningSummary}
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
          favoriteIds={learning.favorites}
          onToggleFavorite={handleToggleFavorite}
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
        />
      )}
      {state.screen === 'answers' && <AnswerKey questions={QUESTIONS} onBack={backToHome} />}
      {state.screen === 'history' && (
        <History
          history={history}
          learningSummary={learningSummary}
          onBack={backToHome}
          onClear={handleClearHistory}
          onResetLearning={handleResetLearning}
        />
      )}
      {state.screen === 'terrain' && <Terrain />}
      {showBottomNav && <BottomNav activeScreen={state.screen} onNavigate={navigateTo} />}
    </div>
  )
}
