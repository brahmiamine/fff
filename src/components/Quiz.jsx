import { useState } from 'react'
import ProgressBar from './ProgressBar.jsx'
import QuestionCard from './QuestionCard.jsx'

export default function Quiz({ questions, onFinish, onAbort }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [revealed, setRevealed] = useState(false)

  const question = questions[index]
  const selected = answers[question.id] || []
  const isLast = index === questions.length - 1

  function toggleOption(optionId) {
    setAnswers((prev) => {
      const current = prev[question.id] || []
      let next
      if (question.type === 'multiple') {
        next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
      } else {
        next = [optionId]
      }
      return { ...prev, [question.id]: next }
    })
  }

  function handleValidate() {
    if (selected.length === 0) return
    setRevealed(true)
  }

  function handleNext() {
    if (isLast) {
      onFinish(answers)
      return
    }
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  function handleSkip() {
    const nextAnswers = { ...answers, [question.id]: [] }
    setAnswers(nextAnswers)
    if (isLast) {
      onFinish(nextAnswers)
      return
    }
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="screen quiz-screen">
      <div className="quiz-header">
        <button type="button" className="btn-link" onClick={onAbort}>
          ← Quitter
        </button>
        <ProgressBar current={index + 1} total={questions.length} />
      </div>

      <QuestionCard
        question={question}
        selected={selected}
        revealed={revealed}
        onToggleOption={toggleOption}
      />

      <div className="quiz-actions">
        {!revealed ? (
          <div className="quiz-actions-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={selected.length === 0}
              onClick={handleValidate}
            >
              Valider
            </button>
            <button type="button" className="btn-skip" onClick={handleSkip}>
              Suivant →
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            {isLast ? 'Voir les résultats' : 'Question suivante'}
          </button>
        )}
      </div>
    </div>
  )
}
