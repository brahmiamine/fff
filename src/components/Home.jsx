import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'

export default function Home({ totalQuestions, onStart, resumable, resumeIndex, onResume, onReset }) {
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
            <button type="button" className="btn btn-primary btn-start" onClick={onStart}>
              Commencer le quiz
            </button>
          </>
        )}
      </div>

      <p className="footer-note">
        Questions extraites du test théorique officiel de la Commission Départementale de
        l'Arbitrage (CDA) — District Parisien de Football, saison 2026/2027. À but d'entraînement.
      </p>
    </div>
  )
}
