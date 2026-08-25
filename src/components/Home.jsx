import { useMemo, useState } from 'react'
import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'
import { computeCountTiers } from '../utils/tiers.js'

const SECONDS_PER_QUESTION = 60

function PresetButton({ title, detail, disabled, onClick }) {
  return (
    <button type="button" className="preset-card" disabled={disabled} onClick={onClick}>
      <span className="preset-title">{title}</span>
      <span className="preset-detail">{detail}</span>
    </button>
  )
}

export default function Home({
  allQuestions,
  onStart,
  resumable,
  resumeIndex,
  resumeTotal,
  resumeMode,
  onResume,
  onReset,
  onViewAnswers,
  onViewHistory,
  learningSummary,
}) {
  const totalQuestions = allQuestions.length
  const categories = useMemo(() => [...new Set(allQuestions.map((q) => q.category))], [allQuestions])

  const [category, setCategory] = useState('all')
  const filteredTotal = useMemo(
    () => (category === 'all' ? totalQuestions : allQuestions.filter((q) => q.category === category).length),
    [allQuestions, category, totalQuestions],
  )

  const tiers = useMemo(() => computeCountTiers(filteredTotal), [filteredTotal])
  const [count, setCount] = useState(filteredTotal)
  const [timed, setTimed] = useState(false)
  const [mode, setMode] = useState('training')

  function handleCategoryChange(next) {
    setCategory(next)
    const nextTotal = next === 'all' ? totalQuestions : allQuestions.filter((q) => q.category === next).length
    setCount(nextTotal)
  }

  function handleReset() {
    if (window.confirm('Réinitialiser le quiz en cours ?')) onReset()
  }

  const timedMinutes = Math.round((count * SECONDS_PER_QUESTION) / 60)
  const standardCount = Math.min(20, totalQuestions)

  return (
    <div className="screen home-screen">
      <div className="logos-row">
        <img src={fffLogo} alt="Logo FFF" className="logo logo-fff" />
        <img src={district75Logo} alt="Logo District 75 Paris" className="logo logo-district" />
      </div>

      <h1 className="app-title">Quiz Arbitrage</h1>
      <p className="app-subtitle">Entraînement CDA — District de Paris</p>

      {resumable ? (
        <div className="card setup-card">
          <p className="field-label">Quiz en pause</p>
          <p className="setup-text">
            Question {resumeIndex + 1} sur {resumeTotal} · {resumeMode === 'exam' ? 'Mode examen' : 'Mode entraînement'}
          </p>
          <button type="button" className="btn btn-primary" onClick={onResume}>Reprendre le quiz</button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>Réinitialiser et recommencer</button>
        </div>
      ) : (
        <>
          <div className="card dashboard-card">
            <div><strong>{learningSummary.seenQuestions}</strong><span>questions vues</span></div>
            <div><strong>{learningSummary.masteredQuestions}</strong><span>maîtrisées</span></div>
            <div><strong>{learningSummary.dueCount}</strong><span>à revoir</span></div>
          </div>

          <div className="card setup-card">
            <p className="field-label">Choisir un entraînement</p>
            <div className="preset-grid">
              <PresetButton title="⚡ Quiz rapide" detail={`${Math.min(10, totalQuestions)} questions`} onClick={() => onStart({ count: Math.min(10, totalQuestions), preset: 'quick' })} />
              <PresetButton title="🎯 Entraînement" detail={`${standardCount} questions`} onClick={() => onStart({ count: standardCount, preset: 'training' })} />
              <PresetButton title="⏱ Examen blanc" detail={`${standardCount} questions · ${standardCount} min`} onClick={() => onStart({ count: standardCount, preset: 'mock', mode: 'exam', timeLimitSeconds: standardCount * SECONDS_PER_QUESTION })} />
              <PresetButton title="🧠 Adaptatif" detail="priorise tes besoins" onClick={() => onStart({ count: standardCount, preset: 'adaptive' })} />
              <PresetButton title="📉 Points faibles" detail="catégories à renforcer" onClick={() => onStart({ count: standardCount, preset: 'weak' })} />
              <PresetButton title="🗓 À réviser" detail={`${learningSummary.dueCount} disponible${learningSummary.dueCount > 1 ? 's' : ''}`} disabled={learningSummary.dueCount === 0} onClick={() => onStart({ count: Math.min(20, learningSummary.dueCount), preset: 'due' })} />
              <PresetButton title="❌ Mes erreurs" detail={`${learningSummary.mistakeCount} question${learningSummary.mistakeCount > 1 ? 's' : ''}`} disabled={learningSummary.mistakeCount === 0} onClick={() => onStart({ count: Math.min(20, learningSummary.mistakeCount), preset: 'mistakes' })} />
              <PresetButton title="⭐ Favoris" detail={`${learningSummary.favoriteCount} question${learningSummary.favoriteCount > 1 ? 's' : ''}`} disabled={learningSummary.favoriteCount === 0} onClick={() => onStart({ count: Math.min(20, learningSummary.favoriteCount), preset: 'favorites' })} />
            </div>
          </div>

          <div className="card setup-card">
            <p className="field-label">Quiz personnalisé</p>
            <select className="select-input" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="count-options" role="group" aria-label="Nombre de questions">
              {tiers.map((tier) => (
                <button type="button" key={tier} className={`chip ${count === tier ? 'chip-active' : ''}`} onClick={() => setCount(tier)}>
                  {tier === filteredTotal ? `Toutes (${tier})` : tier}
                </button>
              ))}
            </div>

            <div className="mode-toggle" role="group" aria-label="Mode du quiz">
              <button type="button" className={`chip ${mode === 'training' ? 'chip-active' : ''}`} onClick={() => setMode('training')}>Entraînement</button>
              <button type="button" className={`chip ${mode === 'exam' ? 'chip-active' : ''}`} onClick={() => setMode('exam')}>Examen</button>
            </div>

            <button type="button" className={`chip chip-wide ${timed ? 'chip-active' : ''}`} onClick={() => setTimed((value) => !value)}>
              ⏱ Chrono {timed ? `activé (≈ ${timedMinutes} min)` : 'désactivé'}
            </button>

            <button type="button" className="btn btn-primary btn-start" onClick={() => onStart({ count, category, mode, preset: 'custom', timeLimitSeconds: timed ? count * SECONDS_PER_QUESTION : null })}>
              Commencer le quiz
            </button>
          </div>
        </>
      )}

      {!resumable && (
        <div className="home-links">
          <button type="button" className="link-button" onClick={onViewHistory}>Progression & historique</button>
          <button type="button" className="link-button" onClick={onViewAnswers}>Toutes les questions et réponses</button>
        </div>
      )}

      <p className="footer-note">Questions issues du test théorique CDA — District Parisien de Football, saison 2026/2027. À but d'entraînement.</p>
    </div>
  )
}
