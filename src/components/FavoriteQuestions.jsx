import QuestionMedia from './QuestionMedia.jsx'
import PageBackButton from './PageBackButton.jsx'

export default function FavoriteQuestions({ questions, favoriteIds, memorizedIds, onToggleFavorite, onStart, onBack }) {
  const favorites = new Set(favoriteIds)
  const memorized = new Set(memorizedIds)
  const items = questions.filter((question) => favorites.has(question.id))
  const trainableItems = items.filter((question) => !memorized.has(question.id))

  return (
    <div className="screen collection-screen">
      <PageBackButton onBack={onBack} />

      <div className="collection-heading">
        <h1 className="app-title">Mes favoris</h1>
        <p className="app-subtitle">
          {items.length} question{items.length > 1 ? 's' : ''} enregistrée{items.length > 1 ? 's' : ''}
        </p>
      </div>

      {trainableItems.length > 0 && (
        <button
          type="button"
          className="btn btn-primary collection-start-button"
          onClick={() => onStart({ count: Math.min(20, trainableItems.length), preset: 'favorites' })}
        >
          Réviser mes favoris ({Math.min(20, trainableItems.length)})
        </button>
      )}

      {items.length === 0 ? (
        <div className="card collection-empty">
          <strong>Aucun favori</strong>
          <p>Ajoute une étoile à une question pendant un quiz pour la retrouver ici.</p>
        </div>
      ) : (
        <div className="review-list">
          {items.map((question) => {
            const isMemorized = memorized.has(question.id)
            return (
              <article key={question.id} className="card collection-item">
                <div className="collection-item-meta">
                  <span className="badge">{question.category}</span>
                  {isMemorized && <span className="badge collection-muted-badge">Mémorisée</span>}
                </div>
                <p className="review-question">{question.question}</p>
                <QuestionMedia question={question} compact />
                {isMemorized && <p className="collection-note">Cette question reste dans tes favoris mais ne sera pas proposée dans les quiz.</p>}
                <button type="button" className="collection-remove-button" onClick={() => onToggleFavorite(question.id)}>
                  ★ Retirer des favoris
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
