import { useEffect, useRef, useState } from 'react'
import ProgressBar from './ProgressBar.jsx'
import QuestionCard from './QuestionCard.jsx'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Quiz({
  questions,
  currentIndex,
  setCurrentIndex,
  answers,
  setAnswers,
  timeLimitSeconds,
  startedAt,
  onFinish,
  onAbort,
  onReset,
}) {
  const [revealed, setRevealed] = useState(false)
  const [now, setNow] = useState(Date.now())
  const finishedRef = useRef(false)

  const question = questions[currentIndex]
  const selected = answers[question.id] || []
  const isLast = currentIndex === questions.length - 1

  const remaining = timeLimitSeconds
    ? Math.max(0, timeLimitSeconds - Math.floor((now - startedAt) / 1000))
    : null

  useEffect(() => {
    if (!timeLimitSeconds) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timeLimitSeconds])

  useEffect(() => {
    if (timeLimitSeconds && remaining === 0 && !finishedRef.current) {
      finishedRef.current = true
      onFinish(answers)
    }
  }, [remaining, timeLimitSeconds, answers, onFinish])

  function toggleOption(optionId) {
    const current = answers[question.id] || []
    let next
    if (question.type === 'multiple') {
      next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    } else {
      next = [optionId]
    }
    setAnswers({ ...answers, [question.id]: next })
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
    setCurrentIndex(currentIndex + 1)
  }

  function handleSkip() {
    const nextAnswers = { ...answers, [question.id]: [] }
    setAnswers(nextAnswers)
    if (isLast) {
      onFinish(nextAnswers)
      return
    }
    setRevealed(false)
    setCurrentIndex(currentIndex + 1)
  }

  function handleReset() {
    if (window.confirm('Réinitialiser toute la progression de ce quiz ?')) {
      onReset()
    }
  }

  return (
    <div className="screen quiz-screen">
      <div className="quiz-header">
        <div className="quiz-header-actions">
          <button type="button" className="btn-link" onClick={onAbort}>
            ← Quitter
          </button>
          {timeLimitSeconds && (
            <span className={`timer-badge ${remaining <= 30 ? 'timer-badge-low' : ''}`}>
              ⏱ {formatTime(remaining)}
            </span>
          )}
          <button type="button" className="btn-link btn-reset" onClick={handleReset}>
            Réinitialiser
          </button>
        </div>
        <ProgressBar current={currentIndex + 1} total={questions.length} />
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
