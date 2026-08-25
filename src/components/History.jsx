import { computeCategoryStats } from '../utils/history.js'

export default function History({ history, learningSummary, onBack, onClear, onResetLearning }) {
  const categoryStats = computeCategoryStats(history)
  const recent = history.slice(0, 8).reverse()
  const best = history.length ? Math.max(...history.map((entry) => entry.scoreTotal || 0)) : 0
  const lastFive = history.slice(0, 5)
  const average = lastFive.length ? Math.round((lastFive.reduce((sum, entry) => sum + (entry.scoreTotal || 0), 0) / lastFive.length) * 10) / 10 : 0
  const weakQuestions = [...learningSummary.perQuestion].filter((item) => item.seenCount > 0).sort((a, b) => a.mastery - b.mastery || b.wrongCount - a.wrongCount).slice(0, 8)

  function handleClear() {
    if (window.confirm("Effacer tout l'historique des quiz ?")) onClear()
  }

  function handleResetLearning() {
    if (window.confirm("Réinitialiser les favoris, les questions mémorisées et les statistiques par question ?")) onResetLearning()
  }

  return (
    <div className="screen history-screen">
      {onBack && (
        <div className="quiz-header">
          <button type="button" className="btn-link" onClick={onBack}>← Paramètres</button>
        </div>
      )}
      <h1 className="app-title">Statistiques</h1>
      <p className="app-subtitle">Résultats, maîtrise et progression</p>

      <div className="stats-grid">
        <div className="card stat-card"><strong>{best}</strong><span>meilleur /100</span></div>
        <div className="card stat-card"><strong>{average}</strong><span>moyenne récente</span></div>
        <div className="card stat-card"><strong>{learningSummary.masteredQuestions}</strong><span>maîtrisées</span></div>
        <div className="card stat-card"><strong>{learningSummary.seenQuestions}</strong><span>questions vues</span></div>
      </div>

      {recent.length > 0 && (
        <div className="card progress-card">
          <p className="field-label">Évolution des derniers quiz</p>
          <div className="trend-bars">
            {recent.map((entry, index) => <div key={`${entry.date}-${index}`} className="trend-item"><span className="trend-bar" style={{ height: `${Math.max(8, entry.scoreTotal)}%` }} /><small>{Math.round(entry.scoreTotal)}</small></div>)}
          </div>
        </div>
      )}

      {categoryStats.length > 0 && (
        <div className="card progress-card">
          <p className="field-label">Maîtrise par catégorie</p>
          {categoryStats.map((item) => (
            <div className="metric-row" key={item.category}>
              <div className="metric-label"><span>{item.category}</span><strong>{Math.round(item.rate * 100)}%</strong></div>
              <div className="metric-track"><span style={{ width: `${Math.round(item.rate * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      )}

      {weakQuestions.length > 0 && (
        <div className="card progress-card">
          <p className="field-label">Questions prioritaires</p>
          <div className="weak-question-list">
            {weakQuestions.map((item) => (
              <div key={item.id} className="weak-question-item">
                <div><strong>{Math.round(item.mastery * 100)}%</strong><span>{item.category}</span></div>
                <p>{item.question}</p>
                <small>{item.seenCount} vue{item.seenCount > 1 ? 's' : ''} · {item.wrongCount} erreur{item.wrongCount > 1 ? 's' : ''}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="review-list">
        {history.map((entry, index) => (
          <div key={`${entry.date}-${index}`} className="card review-item review-ok">
            <p className="review-number">{new Date(entry.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="review-question">{entry.scoreTotal} / 100</p>
            <p className="review-line">{entry.goodCount} / {entry.total} entièrement correctes · {entry.mode === 'exam' ? 'Examen' : 'Entraînement'}{entry.unanswered > 0 && ` · ${entry.unanswered} non répondue${entry.unanswered > 1 ? 's' : ''}`}</p>
          </div>
        ))}
      </div>

      {history.length === 0 && <p className="setup-text">Termine un quiz pour commencer à suivre tes statistiques.</p>}
      {history.length > 0 && <button type="button" className="link-button" onClick={handleClear}>Effacer l'historique</button>}
      <button type="button" className="link-button danger-link" onClick={handleResetLearning}>Réinitialiser l'apprentissage intelligent</button>
    </div>
  )
}
