import QuestionMedia from './QuestionMedia.jsx'

export default function UnvalidatedQuestions({ questions, validatedIds, onBack }) {
  const validated = new Set(validatedIds)
  const items = questions.filter((question) => !validated.has(question.id))

  return (
    <div className="screen collection-screen">
      <div className="quiz-header">
        <button type="button" className="btn-link" onClick={onBack}>← Paramètres</button>
      </div>

      <div className="collection-heading">
        <h1 className="app-title">Questions jamais validées</h1>
        <p className="app-subtitle">
          {items.length} question{items.length > 1 ? 's' : ''} à valider au moins une fois
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card collection-empty collection-success-empty">
          <strong>Toutes les questions ont été validées</strong>
          <p>Chaque question a déjà été répondue et validée au moins une fois.</p>
        </div>
      ) : (
        <div className="review-list">
          {items.map((question, index) => (
            <article key={question.id} className="card collection-item">
              <div className="collection-item-meta">
                <span className="badge">{question.category}</span>
                {question.law && <span className="badge badge-law">{question.law}</span>}
              </div>
              <p className="review-number">Question {index + 1}</p>
              <p className="review-question">{question.question}</p>
              <QuestionMedia question={question} compact />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
