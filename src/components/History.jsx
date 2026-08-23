import { computeCategoryStats } from '../utils/history.js'

export default function History({ history, onBack, onClear }) {
  const categoryStats = computeCategoryStats(history)
  const weakCategories = categoryStats.filter((c) => c.total >= 2 && c.rate < 0.7)

  function handleClear() {
    if (window.confirm("Effacer tout l'historique des quiz ?")) {
      onClear()
    }
  }

  return (
    <div className="screen history-screen">
      <div className="quiz-header">
        <button type="button" className="btn-link" onClick={onBack}>
          ← Retour
        </button>
      </div>

      <h1 className="app-title">Mon historique</h1>
      <p className="app-subtitle">
        {history.length > 0
          ? `${history.length} quiz enregistré${history.length > 1 ? 's' : ''}`
          : 'Aucun quiz terminé pour le moment'}
      </p>

      {weakCategories.length > 0 && (
        <div className="card weak-card">
          <p className="field-label">Catégories à travailler</p>
          <ul className="weak-list">
            {weakCategories.map((c) => (
              <li key={c.category} className="weak-item">
                <span>{c.category}</span>
                <span className="weak-rate">{Math.round(c.rate * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {history.length > 0 ? (
        <div className="review-list">
          {history.map((entry, i) => (
            <div key={i} className="card review-item review-ok">
              <p className="review-number">
                {new Date(entry.date).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="review-question">{entry.scoreTotal} / 100</p>
              <p className="review-line">
                {entry.goodCount} / {entry.total} questions entièrement correctes
                {entry.unanswered > 0 && ` · ${entry.unanswered} non répondue${entry.unanswered > 1 ? 's' : ''}`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="setup-text">Termine un quiz pour commencer à suivre ta progression.</p>
      )}

      {history.length > 0 && (
        <button type="button" className="link-button" onClick={handleClear}>
          Effacer l'historique
        </button>
      )}
    </div>
  )
}
