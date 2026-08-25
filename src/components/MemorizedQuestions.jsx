const BASE = import.meta.env.BASE_URL

export default function MemorizedQuestions({ questions, memorizedIds, onToggleMemorized }) {
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
              <p className="review-question">{question.question}</p>

              {question.image && <img src={`${BASE}${question.image}`} alt="" className="review-image" />}

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

              {question.explanation && <p className="review-explanation">{question.explanation}</p>}

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
