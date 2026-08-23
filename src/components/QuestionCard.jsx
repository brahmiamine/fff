const BASE = import.meta.env.BASE_URL

export default function QuestionCard({ question, selected, revealed, onToggleOption }) {
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
      <div className="question-meta">
        <span className="badge">{question.category}</span>
        <span className="badge badge-type">{isMultiple ? 'Choix multiple' : 'Choix unique'}</span>
      </div>

      <h2 className="question-text">{question.question}</h2>

      {question.image && (
        <div className="question-image-wrap">
          <img src={`${BASE}${question.image}`} alt="" className="question-image" />
        </div>
      )}

      <div className="options-list" role={isMultiple ? 'group' : 'radiogroup'}>
        {question.options.map((opt) => {
          const state = optionState(opt.id)
          return (
            <button
              type="button"
              key={opt.id}
              className={`option-btn${state ? ` option-${state}` : ''}`}
              onClick={() => !revealed && onToggleOption(opt.id)}
              disabled={revealed}
              aria-pressed={selected.includes(opt.id)}
            >
              <span className={`option-marker ${isMultiple ? 'marker-square' : 'marker-round'}`}>
                {selected.includes(opt.id) && <span className="option-marker-dot" />}
              </span>
              <span className="option-text">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className={`feedback-box ${isAnswerCorrect(question, selected) ? 'feedback-ok' : 'feedback-ko'}`}>
          <p className="feedback-title">
            {isAnswerCorrect(question, selected) ? 'Bonne réponse !' : 'Réponse incorrecte'}
          </p>
          {question.explanation && <p className="feedback-explanation">{question.explanation}</p>}
        </div>
      )}
    </div>
  )
}

export function isAnswerCorrect(question, selected) {
  const correct = [...question.correct].sort()
  const chosen = [...selected].sort()
  return correct.length === chosen.length && correct.every((id, i) => id === chosen[i])
}
