import { useEffect, useRef, useState } from 'react'
import ProgressBar from './ProgressBar.jsx'
import QuestionCard from './QuestionCard.jsx'
import { getRemainingSeconds } from '../utils/session.js'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function MemorizeButton({ active, onClick }) {
  return (
    <button
      type="button"
      className={`quiz-memorize-button ${active ? 'quiz-memorize-button-active' : ''}`}
      onClick={onClick}
      aria-label={active ? 'Retirer des questions mémorisées' : 'Mémoriser cette question'}
      aria-pressed={active}
      title={active ? 'Question mémorisée' : 'Mémoriser cette question'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.35L6 21V4.75Z" />
      </svg>
    </button>
  )
}

export default function Quiz({
  questions,
  currentIndex,
  setCurrentIndex,
  answers,
  setAnswers,
  timeLimitSeconds,
  deadlineAt,
  remainingSeconds,
  mode,
  onFinish,
  onAbort,
  onReset,
  favoriteIds,
  onToggleFavorite,
  memorizedIds,
  onToggleMemorized,
  showExplanations,
}) {
  const [revealed, setRevealed] = useState(false)
  const [now, setNow] = useState(Date.now())
  const finishedRef = useRef(false)

  const question = questions[currentIndex]
  const selected = answers[question.id] || []
  const isLast = currentIndex === questions.length - 1
  const isExam = mode === 'exam'
  const isMemorized = memorizedIds.includes(question.id)
  const remaining = timeLimitSeconds ? getRemainingSeconds(deadlineAt, remainingSeconds ?? timeLimitSeconds, now) : null

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
    const next = question.type === 'multiple'
      ? current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
      : [optionId]
    setAnswers({ ...answers, [question.id]: next })
  }

  function handleValidate() {
    if (selected.length > 0) setRevealed(true)
  }

  function goTo(index) {
    setRevealed(false)
    setCurrentIndex(index)
  }

  function handleNext() {
    if (isLast) {
      if (!isExam || window.confirm("Terminer l'examen et afficher les résultats ?")) onFinish(answers)
      return
    }
    goTo(currentIndex + 1)
  }

  function handleReset() {
    if (window.confirm('Réinitialiser toute la progression de ce quiz ?')) onReset()
  }

  return (
    <div className="screen quiz-screen">
      <div className="quiz-header">
        <div className="quiz-header-actions">
          <button type="button" className="btn-link" onClick={onAbort}>← Mettre en pause</button>
          {timeLimitSeconds && <span className={`timer-badge ${remaining <= 30 ? 'timer-badge-low' : ''}`}>⏱ {formatTime(remaining)}</span>}
          <button type="button" className="btn-link btn-reset" onClick={handleReset}>Réinitialiser</button>
        </div>
        <div className="mode-line"><span className="badge mode-badge">{isExam ? 'Mode examen' : 'Mode entraînement'}</span></div>
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <QuestionCard
        question={question}
        selected={selected}
        revealed={!isExam && revealed}
        onToggleOption={toggleOption}
        isFavorite={favoriteIds.includes(question.id)}
        onToggleFavorite={() => onToggleFavorite(question.id)}
        showExplanations={showExplanations}
      />

      <div className="quiz-actions">
        {isExam ? (
          <div className="exam-actions quiz-actions-with-memorize">
            <button type="button" className="btn btn-secondary" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>← Précédente</button>
            <MemorizeButton active={isMemorized} onClick={() => onToggleMemorized(question.id)} />
            <button type="button" className="btn btn-primary" onClick={handleNext}>{isLast ? "Terminer l'examen" : 'Suivante →'}</button>
          </div>
        ) : !revealed ? (
          <div className="quiz-actions-row quiz-actions-with-memorize">
            <button type="button" className="btn btn-primary" disabled={selected.length === 0} onClick={handleValidate}>Valider</button>
            <MemorizeButton active={isMemorized} onClick={() => onToggleMemorized(question.id)} />
          </div>
        ) : (
          <div className="quiz-actions-row quiz-actions-with-memorize">
            <button type="button" className="btn btn-primary" onClick={handleNext}>{isLast ? 'Voir les résultats' : 'Question suivante'}</button>
            <MemorizeButton active={isMemorized} onClick={() => onToggleMemorized(question.id)} />
          </div>
        )}
      </div>
    </div>
  )
}
