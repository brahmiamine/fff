import { useMemo, useState } from 'react'
import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'
import { computeCountTiers } from '../utils/tiers.js'

const SECONDS_PER_QUESTION = 60

export default function Home({
  allQuestions,
  onStart,
  resumable,
  resumeIndex,
  onResume,
  onReset,
  onViewAnswers,
  onViewHistory,
}) {
  const totalQuestions = allQuestions.length
  const categories = useMemo(() => [...new Set(allQuestions.map((q) => q.category))], [allQuestions])

  const [category, setCategory] = useState('all')
  const filteredTotal = useMemo(
    () =>
      category === 'all'
        ? totalQuestions
        : allQuestions.filter((q) => q.category === category).length,
    [allQuestions, category, totalQuestions],
  )

  const tiers = useMemo(() => computeCountTiers(filteredTotal), [filteredTotal])
  const [count, setCount] = useState(filteredTotal)
  const [timed, setTimed] = useState(false)

  function handleCategoryChange(next) {
    setCategory(next)
    const nextTotal =
      next === 'all' ? totalQuestions : allQuestions.filter((q) => q.category === next).length
    setCount(nextTotal)
  }

  function handleReset() {
    if (window.confirm('Réinitialiser toute la progression de ce quiz ?')) {
      onReset()
    }
  }

  const timedMinutes = Math.round((count * SECONDS_PER_QUESTION) / 60)

  return (
    <div className="screen home-screen">
      <div className="logos-row">
        <img src={fffLogo} alt="Logo FFF" className="logo logo-fff" />
        <img src={district75Logo} alt="Logo District 75 Paris" className="logo logo-district" />
      </div>

      <h1 className="app-title">Quiz Arbitrage</h1>
      <p className="app-subtitle">Entraînement au test théorique de la CDA — District de Paris</p>

      <div className="card setup-card">
        {resumable ? (
          <>
            <p className="setup-text">
              Tu as un quiz en cours, à la question {resumeIndex + 1} sur {totalQuestions}.
            </p>
            <button type="button" className="btn btn-primary btn-start" onClick={onResume}>
              Reprendre le quiz
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Réinitialiser et recommencer
            </button>
          </>
        ) : (
          <>
            <p className="setup-text">
              {totalQuestions} questions officielles issues de l'examen théorique CDA, avec correction
              et explication détaillée après chaque réponse.
            </p>

            <span className="field-label">Catégorie</span>
            <select
              className="select-input"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <span className="field-label">Nombre de questions</span>
            <div className="count-options" role="group" aria-label="Nombre de questions">
              {tiers.map((tier) => (
                <button
                  type="button"
                  key={tier}
                  className={`chip ${count === tier ? 'chip-active' : ''}`}
                  onClick={() => setCount(tier)}
                >
                  {tier === filteredTotal ? `Toutes (${tier})` : tier}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`chip chip-wide ${timed ? 'chip-active' : ''}`}
              onClick={() => setTimed((v) => !v)}
            >
              ⏱ Mode chrono {timed ? `activé (≈ ${timedMinutes} min)` : 'désactivé'}
            </button>

            <button
              type="button"
              className="btn btn-primary btn-start"
              onClick={() => onStart({ count, category, timeLimitSeconds: timed ? count * SECONDS_PER_QUESTION : null })}
            >
              Commencer le quiz
            </button>
          </>
        )}
      </div>

      {!resumable && (
        <div className="home-links">
          <button type="button" className="link-button" onClick={onViewAnswers}>
            Voir toutes les questions et réponses
          </button>
          <button type="button" className="link-button" onClick={onViewHistory}>
            Voir mon historique
          </button>
        </div>
      )}

      <p className="footer-note">
        Questions extraites du test théorique officiel de la Commission Départementale de
        l'Arbitrage (CDA) — District Parisien de Football, saison 2026/2027. À but d'entraînement.
      </p>
    </div>
  )
}
