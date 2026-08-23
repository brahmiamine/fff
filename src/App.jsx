import { useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import questionsData from './data/questions.json'
import { prepareQuestions } from './utils/shuffle.js'

const PASS_THRESHOLD = 0.8

export default function App() {
  const [screen, setScreen] = useState('home')
  const [quizQuestions, setQuizQuestions] = useState([])
  const [answers, setAnswers] = useState({})

  function startQuiz() {
    setQuizQuestions(prepareQuestions(questionsData))
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
      {screen === 'home' && <Home totalQuestions={questionsData.length} onStart={startQuiz} />}
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
