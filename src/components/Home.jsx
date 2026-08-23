import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'

export default function Home({ totalQuestions, onStart }) {
  return (
    <div className="screen home-screen">
      <div className="logos-row">
        <img src={fffLogo} alt="Logo FFF" className="logo logo-fff" />
        <img src={district75Logo} alt="Logo District 75 Paris" className="logo logo-district" />
      </div>

      <h1 className="app-title">Quiz Arbitrage</h1>
      <p className="app-subtitle">Entraînement au test théorique de la CDA — District de Paris</p>

      <div className="card setup-card">
        <p className="setup-text">
          {totalQuestions} questions officielles issues de l'examen théorique CDA, avec correction
          et explication détaillée après chaque réponse.
        </p>
        <button type="button" className="btn btn-primary btn-start" onClick={onStart}>
          Commencer le quiz
        </button>
      </div>

      <p className="footer-note">
        Questions extraites du test théorique officiel de la Commission Départementale de
        l'Arbitrage (CDA) — District Parisien de Football, saison 2025/2026. À but d'entraînement.
      </p>
    </div>
  )
}
