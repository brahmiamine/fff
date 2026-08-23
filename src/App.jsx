import { useMemo, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import questionsData from './data/questions.json'
import { pickQuestions } from './utils/shuffle.js'

const PASS_THRESHOLD = 0.8

export default function App() {
  const [screen, setScreen] = useState('home')
  const [quizQuestions, setQuizQuestions] = useState([])
  const [answers, setAnswers] = useState({})

  const categories = useMemo(
    () => [...new Set(questionsData.map((q) => q.category))],
    [],
  )

  function startQuiz({ category, count }) {
    const selected = pickQuestions(questionsData, { category, count })
    setQuizQuestions(selected)
    setAnswers({})
    setScreen('quiz')
  }

  function finishQuiz(finalAnswers) {
    setAnswers(finalAnswers)
    setScreen('results')
  }

  function restart() {
    setScreen('home')
    setQuizQuestions([])
    setAnswers({})
  }

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <Home categories={categories} totalQuestions={questionsData.length} onStart={startQuiz} />
      )}
      {screen === 'quiz' && (
        <Quiz questions={quizQuestions} onFinish={finishQuiz} onAbort={restart} />
      )}
      {screen === 'results' && (
        <Results
          questions={quizQuestions}
          answers={answers}
          passThreshold={PASS_THRESHOLD}
          onRestart={restart}
        />
      )}
    </div>
  )
}
