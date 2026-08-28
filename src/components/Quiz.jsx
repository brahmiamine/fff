import { useEffect, useRef, useState } from 'react'
import ProgressBar from './ProgressBar.jsx'
import QuestionCard from './QuestionCard.jsx'
import { getRemainingSeconds } from '../utils/session.js'
import { isAnswerCorrect } from '../utils/answers.js'
import { playSound, unlockAudio } from '../utils/sound.js'

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function FavoriteButton({ active, onClick }) {
  return (
    <button
      type="button"
      className={`quiz-favorite-button ${active ? 'quiz-favorite-button-active' : ''}`}
      onClick={onClick}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={active}
      title={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 2.8 5.67 6.26.91-4.53 4.42 1.07 6.24L12 17.3l-5.6 2.94L7.47 14 2.94 9.58l6.26-.91L12 3Z" />
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
  onValidate,
  favoriteIds,
  onToggleFavorite,
  showExplanations,
  soundsEnabled = true,
}) {
  const [revealed, setRevealed] = useState(false)
  const [now, setNow] = useState(Date.now())
  const finishedRef = useRef(false)
  const timerCuesRef = useRef(new Set())

  const question = questions[currentIndex]
  const selected = answers[question.id] || []
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const isExam = mode === 'exam'
  const isFavorite = favoriteIds.includes(question.id)
  const remaining = timeLimitSeconds ? getRemainingSeconds(deadlineAt, remainingSeconds ?? timeLimitSeconds, now) : null

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [currentIndex])

  useEffect(() => {
    if (!timeLimitSeconds) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timeLimitSeconds])

  useEffect(() => {
    timerCuesRef.current.clear()
  }, [deadlineAt])

  useEffect(() => {
    if (!timeLimitSeconds || remaining === null) return

    if ((remaining === 5 || remaining === 3) && !timerCuesRef.current.has(remaining)) {
      timerCuesRef.current.add(remaining)
      void playSound('tick', soundsEnabled)
    }

    if (remaining === 0 && !finishedRef.current) {
      finishedRef.current = true
      void playSound('timeout', soundsEnabled)
      onFinish(answers)
    }
  }, [remaining, timeLimitSeconds, answers, onFinish, soundsEnabled])

  function toggleOption(optionId) {
    void unlockAudio(soundsEnabled)
    const current = answers[question.id] || []
    const next = question.type === 'multiple'
      ? current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
      : [optionId]
    setAnswers({ ...answers, [question.id]: next })
  }

  function handleValidate() {
    if (selected.length === 0) return
    onValidate(question, selected)
    void playSound(isAnswerCorrect(question, selected) ? 'correct' : 'wrong', soundsEnabled)
    setRevealed(true)
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
          <button type="button" className="btn-link" onClick={isFirst ? onReset : onAbort}>← {isFirst ? 'Retour' : 'Mettre en pause'}</button>
          {timeLimitSeconds && <span className={`timer-badge ${remaining <= 30 ? 'timer-badge-low' : ''} ${remaining <= 10 ? 'timer-badge-critical' : ''}`}>⏱ {formatTime(remaining)}</span>}
          <button type="button" className="btn-link btn-reset" onClick={handleReset}>Réinitialiser</button>
        </div>
        <div className="mode-line"><span className="badge mode-badge">{isExam ? 'Mode examen' : 'Mode entraînement'}</span></div>
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        selected={selected}
        revealed={!isExam && revealed}
        onToggleOption={toggleOption}
        showExplanations={showExplanations}
      />

      <div className="quiz-actions">
        {isExam ? (
          <div className="exam-actions quiz-actions-with-favorite">
            <button type="button" className="btn btn-secondary" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)}>← Précédente</button>
            <FavoriteButton active={isFavorite} onClick={() => onToggleFavorite(question.id)} />
            <button type="button" className="btn btn-primary" onClick={handleNext}>{isLast ? "Terminer l'examen" : 'Suivante →'}</button>
          </div>
        ) : !revealed ? (
          <div className="quiz-actions-row quiz-actions-with-favorite">
            <button type="button" className="btn btn-primary" disabled={selected.length === 0} onClick={handleValidate}>Valider</button>
            <FavoriteButton active={isFavorite} onClick={() => onToggleFavorite(question.id)} />
          </div>
        ) : (
          <div className="quiz-actions-row quiz-actions-with-favorite">
            <button type="button" className="btn btn-primary" onClick={handleNext}>{isLast ? 'Voir les résultats' : 'Question suivante'}</button>
            <FavoriteButton active={isFavorite} onClick={() => onToggleFavorite(question.id)} />
          </div>
        )}
      </div>
    </div>
  )
}
