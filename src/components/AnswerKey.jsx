import QuestionMedia from './QuestionMedia.jsx'

export default function AnswerKey({ questions, onBack, showExplanations = true }) {
  return (
    <div className="screen answerkey-screen">
      <div className="quiz-header">
        <button type="button" className="btn-link" onClick={onBack}>
          ← Retour
        </button>
      </div>

      <h1 className="app-title">Toutes les questions et réponses</h1>
      <p className="app-subtitle">{questions.length} questions — les bonnes réponses sont cochées ✓</p>

      <div className="review-list">
        {questions.map((q, i) => (
          <div key={q.id} className="card review-item review-ok">
            <p className="review-number">
              Question {i + 1} — {q.category}
            </p>
            <p className="review-question">{q.question}</p>

            <QuestionMedia question={q} compact />

            <ul className="answerkey-options">
              {q.options.map((opt) => {
                const isCorrect = q.correct.includes(opt.id)
                return (
                  <li
                    key={opt.id}
                    className={`answerkey-option ${isCorrect ? 'answerkey-option-correct' : ''}`}
                  >
                    {isCorrect ? '✓ ' : ''}
                    {opt.text}
                  </li>
                )
              })}
            </ul>

            {showExplanations && q.explanation && <p className="review-explanation">{q.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
