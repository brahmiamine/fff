import { useState } from 'react'
import { isAnswerCorrect } from '../utils/answers.js'
import AbbreviationsModal from './AbbreviationsModal.jsx'
import QuestionMedia from './QuestionMedia.jsx'

export default function QuestionCard({
  question,
  selected,
  revealed,
  onToggleOption,
  isFavorite,
  onToggleFavorite,
  showExplanations = true,
}) {
  const [showAbbreviations, setShowAbbreviations] = useState(false)
  const isMultiple = question.type === 'multiple'

  function optionState(optionId) {
    if (!revealed) return selected.includes(optionId) ? 'selected' : ''
    const isCorrect = question.correct.includes(optionId)
    const wasSelected = selected.includes(optionId)
    if (isCorrect) return 'correct'
    if (wasSelected && !isCorrect) return 'incorrect'
    return ''
  }

  return (
    <div className="card question-card">
      <div className="question-topline">
        <div className="question-meta">
          <span className="badge">{question.category}</span>
          <span className="badge badge-type">{isMultiple ? 'Choix multiple' : 'Choix unique'}</span>
          {question.law && <span className="badge badge-law">{question.law}</span>}
        </div>
        <div className="question-learning-actions">
          <button type="button" className={`favorite-button ${isFavorite ? 'favorite-active' : ''}`} aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isFavorite} onClick={onToggleFavorite}>
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>

      <h2 className="question-text">
        <span>{question.question}</span>{' '}
        <button
          type="button"
          className="abbreviations-info-button"
          aria-label="Afficher les abréviations d’arbitrage"
          aria-haspopup="dialog"
          onClick={() => setShowAbbreviations(true)}
          title="Voir les abréviations"
        >
          i
        </button>
      </h2>

      <AbbreviationsModal open={showAbbreviations} onClose={() => setShowAbbreviations(false)} />

      <QuestionMedia question={question} />

      <div className="options-list" role={isMultiple ? 'group' : 'radiogroup'}>
        {question.options.map((opt) => {
          const state = optionState(opt.id)
          return (
            <button type="button" key={opt.id} className={`option-btn${state ? ` option-${state}` : ''}`} onClick={() => !revealed && onToggleOption(opt.id)} disabled={revealed} aria-pressed={selected.includes(opt.id)}>
              <span className={`option-marker ${isMultiple ? 'marker-square' : 'marker-round'}`}>{selected.includes(opt.id) && <span className="option-marker-dot" />}</span>
              <span className="option-text">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className={`feedback-box ${isAnswerCorrect(question, selected) ? 'feedback-ok' : 'feedback-ko'}`}>
          <p className="feedback-title">{isAnswerCorrect(question, selected) ? 'Bonne réponse !' : 'Réponse incorrecte'}</p>
          {showExplanations && question.explanation && <p className="feedback-explanation">{question.explanation}</p>}
          <div className="learning-note">
            {question.takeaway && <p><strong>💡 À retenir :</strong> {question.takeaway}</p>}
            <p><strong>📚 Référence :</strong> {question.source} · {question.season}</p>
            {question.law && <p><strong>⚖️ Loi concernée :</strong> {question.law}</p>}
            {question.districtSpecific && <p><strong>🏙 Spécificité :</strong> règlement District/Ligue</p>}
          </div>
        </div>
      )}
    </div>
  )
}
