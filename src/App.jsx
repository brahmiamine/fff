import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import questionsData from './data/questions.json'
import { prepareQuestions } from './utils/shuffle.js'
import { loadProgress, saveProgress, clearProgress } from './utils/storage.js'

const PASS_THRESHOLD = 0.8

function freshState() {
  return { screen: 'home', quizQuestions: [], answers: {}, currentIndex: 0 }
}

export default function App() {
  const [state, setState] = useState(() => loadProgress(questionsData) || freshState())

  useEffect(() => {
    if (state.screen === 'quiz' || state.screen === 'results') {
      saveProgress(state)
    }
  }, [state])

  function startQuiz() {
    setState({
      screen: 'quiz',
      quizQuestions: prepareQuestions(questionsData),
      answers: {},
      currentIndex: 0,
    })
  }

  function resumeQuiz() {
    setState((s) => ({ ...s, screen: 'quiz' }))
  }

  function finishQuiz(finalAnswers) {
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

  const resumable = state.quizQuestions.length > 0 && state.screen === 'home'

  return (
    <div className="app-shell">
      {state.screen === 'home' && (
        <Home
          totalQuestions={questionsData.length}
          onStart={startQuiz}
          resumable={resumable}
          resumeIndex={state.currentIndex}
          onResume={resumeQuiz}
          onReset={resetProgress}
        />
      )}
      {state.screen === 'quiz' && (
        <Quiz
          questions={state.quizQuestions}
          currentIndex={state.currentIndex}
          setCurrentIndex={setCurrentIndex}
          answers={state.answers}
          setAnswers={setAnswers}
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
        />
      )}
    </div>
  )
}
