import { useState } from 'react'
import QuestionMedia from './QuestionMedia.jsx'
import AbbreviationsModal from './AbbreviationsModal.jsx'

export default function MemorizedQuestions({ questions, memorizedIds, onToggleMemorized, showExplanations = true }) {
  const [showAbbreviations, setShowAbbreviations] = useState(false)
  const memorized = new Set(memorizedIds)
  const items = questions.filter((question) => memorized.has(question.id))

  return (
    <div className="screen memorized-screen">
      <div className="memorized-heading">
        <h1 className="app-title">Questions mémorisées</h1>
        <p className="app-subtitle">
          {items.length} question{items.length > 1 ? 's' : ''} exclue{items.length > 1 ? 's' : ''} des prochains quiz
        </p>
      </div>

      <AbbreviationsModal open={showAbbreviations} onClose={() => setShowAbbreviations(false)} />

      {items.length === 0 ? (
        <div className="card memorized-empty">
          <strong>Aucune question mémorisée</strong>
          <p>Depuis un quiz, utilise le bouton « Mémorisée » pour ne plus revoir une question.</p>
        </div>
      ) : (
        <div className="review-list">
          {items.map((question, index) => (
            <article key={question.id} className="card review-item memorized-item">
              <p className="review-number">Question mémorisée {index + 1} — {question.category}</p>
              <p className="review-question">
                <span>{question.question}</span>{' '}
                <button
                  type="button"
                  className="abbreviations-info-button"
                  aria-label="Afficher l’aide-mémoire arbitre et les abréviations"
                  aria-haspopup="dialog"
                  onClick={() => setShowAbbreviations(true)}
                  title="Aide-mémoire arbitre — Abréviations"
                >
                  i
                </button>
              </p>

              <QuestionMedia question={question} compact />

              <ul className="answerkey-options">
                {question.options.map((option) => {
                  const isCorrect = question.correct.includes(option.id)
                  return (
                    <li key={option.id} className={`answerkey-option ${isCorrect ? 'answerkey-option-correct' : ''}`}>
                      {isCorrect ? '✓ ' : ''}{option.text}
                    </li>
                  )
                })}
              </ul>

              {showExplanations && question.explanation && <p className="review-explanation">{question.explanation}</p>}

              <button
                type="button"
                className="btn btn-secondary memorized-restore-button"
                onClick={() => onToggleMemorized(question.id)}
              >
                ↩ Réactiver dans les quiz
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
