import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import AnswerKey from './components/AnswerKey.jsx'
import History from './components/History.jsx'
import baseQuestionsData from './data/questions.json'
import remisesEnJeuQuestions from './data/remisesEnJeuQuestions.json'
import { prepareQuestions, shuffle } from './utils/shuffle.js'
import { loadProgress, saveProgress, clearProgress } from './utils/storage.js'
import { loadHistory, addHistoryEntry, clearHistory } from './utils/history.js'
import { computeScore } from './utils/scoring.js'
import { isAnswerCorrect } from './components/QuestionCard.jsx'

const questionsData = [...baseQuestionsData, ...remisesEnJeuQuestions]
const PASS_THRESHOLD = 0.8

function freshState() {
  return {
    screen: 'home',
    quizQuestions: [],
    answers: {},
    currentIndex: 0,
    timeLimitSeconds: null,
    startedAt: null,
  }
}

export default function App() {
  const [state, setState] = useState(() => loadProgress(questionsData) || freshState())
  const [history, setHistory] = useState(() => loadHistory())

  useEffect(() => {
    if (state.screen === 'quiz' || state.screen === 'results') {
      saveProgress(state)
    }
  }, [state])

  function startQuiz({ count, category, timeLimitSeconds }) {
    const pool =
      category && category !== 'all' ? questionsData.filter((q) => q.category === category) : questionsData
    const size = Math.min(Math.max(count || pool.length, 1), pool.length)
    setState({
      screen: 'quiz',
      quizQuestions: prepareQuestions(pool).slice(0, size),
      answers: {},
      currentIndex: 0,
      timeLimitSeconds: timeLimitSeconds || null,
      startedAt: timeLimitSeconds ? Date.now() : null,
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
      startedAt: null,
    })
  }

  function resumeQuiz() {
    setState((s) => ({ ...s, screen: 'quiz' }))
  }

  function finishQuiz(finalAnswers) {
    const score = computeScore(state.quizQuestions, finalAnswers)
    const goodCount = state.quizQuestions.filter((q) =>
      isAnswerCorrect(q, finalAnswers[q.id] || []),
    ).length

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
    })
    setHistory(loadHistory())

    setState((s) => ({ ...s, screen: 'results', answers: finalAnswers }))
  }

  // "Quitter" pauses the quiz: back to Home, progress kept for later resume.
  function pauseQuiz() {
    setState((s) => ({ ...s, screen: 'home' }))
  }

  // Fully wipes any saved progress and returns to a clean Home screen.
  function resetProgress() {
    clearProgress()
    setState(freshState())
  }

  function setCurrentIndex(updater) {
    setState((s) => ({
      ...s,
      currentIndex: typeof updater === 'function' ? updater(s.currentIndex) : updater,
    }))
  }

  function setAnswers(nextAnswers) {
    setState((s) => ({ ...s, answers: nextAnswers }))
  }

  function viewAnswers() {
    setState((s) => ({ ...s, screen: 'answers' }))
  }

  function viewHistory() {
    setState((s) => ({ ...s, screen: 'history' }))
  }

  function backToHome() {
    setState((s) => ({ ...s, screen: 'home' }))
  }

  function handleClearHistory() {
    clearHistory()
    setHistory([])
  }

  const resumable = state.quizQuestions.length > 0 && state.screen === 'home'

  return (
    <div className="app-shell">
      {state.screen === 'home' && (
        <Home
          allQuestions={questionsData}
          onStart={startQuiz}
          resumable={resumable}
          resumeIndex={state.currentIndex}
          onResume={resumeQuiz}
          onReset={resetProgress}
          onViewAnswers={viewAnswers}
          onViewHistory={viewHistory}
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
          startedAt={state.startedAt}
          onFinish={finishQuiz}
          onAbort={pauseQuiz}
          onReset={resetProgress}
        />
      )}
      {state.screen === 'results' && (
        <Results
          questions={state.quizQuestions}
          answers={state.answers}
          passThreshold={PASS_THRESHOLD}
          onRestart={resetProgress}
          onReviewMistakes={reviewMistakes}
        />
      )}
      {state.screen === 'answers' && <AnswerKey questions={questionsData} onBack={backToHome} />}
      {state.screen === 'history' && (
        <History history={history} onBack={backToHome} onClear={handleClearHistory} />
      )}
    </div>
  )
}
