export default function MistakeQuestions({ questions, learningSummary, memorizedIds, onStart }) {
  const memorized = new Set(memorizedIds)
  const questionById = new Map(questions.map((question) => [question.id, question]))
  const items = learningSummary.perQuestion
    .filter((item) => item.lastResult === false && !memorized.has(item.id))
    .map((item) => ({ ...item, sourceQuestion: questionById.get(item.id) }))
    .filter((item) => item.sourceQuestion)
    .sort((a, b) => b.wrongCount - a.wrongCount || a.mastery - b.mastery)

  return (
    <div className="screen collection-screen">
      <div className="collection-heading">
        <h1 className="app-title">Mes erreurs</h1>
        <p className="app-subtitle">
          {items.length} question{items.length > 1 ? 's' : ''} à corriger
        </p>
      </div>

      {items.length > 0 && (
        <button
          type="button"
          className="btn btn-primary collection-start-button"
          onClick={() => onStart({ count: Math.min(20, items.length), preset: 'mistakes' })}
        >
          Réviser mes erreurs ({Math.min(20, items.length)})
        </button>
      )}

      {items.length === 0 ? (
        <div className="card collection-empty collection-success-empty">
          <strong>Aucune erreur en cours</strong>
          <p>Une question disparaît automatiquement d’ici dès que tu y réponds correctement.</p>
        </div>
      ) : (
        <div className="review-list">
          {items.map((item) => (
            <article key={item.id} className="card collection-item mistake-item">
              <div className="collection-item-meta">
                <span className="badge">{item.category}</span>
                <span className="mistake-count">{item.wrongCount} erreur{item.wrongCount > 1 ? 's' : ''}</span>
              </div>
              <p className="review-question">{item.question}</p>
              <div className="mistake-progress" aria-label={`Maîtrise ${Math.round(item.mastery * 100)} %`}>
                <span>Maîtrise</span>
                <strong>{Math.round(item.mastery * 100)}%</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
