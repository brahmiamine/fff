import { useState } from 'react'
import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'
import { computeCountTiers } from '../utils/tiers.js'

export default function Home({
  totalQuestions,
  onStart,
  resumable,
  resumeIndex,
  onResume,
  onReset,
  onViewAnswers,
}) {
  const tiers = computeCountTiers(totalQuestions)
  const [count, setCount] = useState(totalQuestions)

  function handleReset() {
    if (window.confirm('Réinitialiser toute la progression de ce quiz ?')) {
      onReset()
    }
  }

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

            <span className="field-label">Nombre de questions</span>
            <div className="count-options" role="group" aria-label="Nombre de questions">
              {tiers.map((tier) => (
                <button
                  type="button"
                  key={tier}
                  className={`chip ${count === tier ? 'chip-active' : ''}`}
                  onClick={() => setCount(tier)}
                >
                  {tier === totalQuestions ? `Toutes (${tier})` : tier}
                </button>
              ))}
            </div>

            <button type="button" className="btn btn-primary btn-start" onClick={() => onStart(count)}>
              Commencer le quiz
            </button>
          </>
        )}
      </div>

      {!resumable && (
        <button type="button" className="link-button" onClick={onViewAnswers}>
          Voir toutes les questions et réponses
        </button>
      )}

      <p className="footer-note">
        Questions extraites du test théorique officiel de la Commission Départementale de
        l'Arbitrage (CDA) — District Parisien de Football, saison 2026/2027. À but d'entraînement.
      </p>
    </div>
  )
}
