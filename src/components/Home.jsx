import { useMemo } from 'react'
import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'
import Terrain from './Terrain.jsx'
import { resolveDefaultQuestionCount } from '../utils/settings.js'

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
  learningSummary,
  memorizedIds,
  settings,
}) {
  const memorizedSet = useMemo(() => new Set(memorizedIds), [memorizedIds])
  const availableQuestions = useMemo(
    () => allQuestions.filter((question) => !memorizedSet.has(question.id)),
    [allQuestions, memorizedSet],
  )
  const totalQuestions = availableQuestions.length

  function handleReset() {
    if (window.confirm('Réinitialiser le quiz en cours ?')) onReset()
  }

  const standardCount = resolveDefaultQuestionCount(settings.defaultQuestionCount, totalQuestions)
  const quickCount = Math.min(10, totalQuestions)
  const noQuestionsAvailable = totalQuestions === 0
  const customTimeLimit = settings.defaultTimed ? standardCount * SECONDS_PER_QUESTION : null

  function startCustomQuiz() {
    onStart({
      count: standardCount,
      category: 'all',
      mode: settings.defaultMode,
      preset: 'custom',
      timeLimitSeconds: customTimeLimit,
    })
  }

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
            <div><strong>{learningSummary.mistakeCount}</strong><span>erreurs actives</span></div>
            <div><strong>{learningSummary.memorizedCount}</strong><span>mémorisées</span></div>
          </div>

          {noQuestionsAvailable && (
            <div className="card setup-card">
              <p className="setup-text">Toutes les questions sont mémorisées. Réactive-en depuis l’onglet « Mémoriser » pour recommencer à les voir dans les quiz.</p>
            </div>
          )}

          <div className="card setup-card">
            <p className="field-label">Choisir un entraînement</p>
            <div className="preset-grid">
              <PresetButton title="⚡ Quiz rapide" detail={`${quickCount} questions`} disabled={quickCount === 0} onClick={() => onStart({ count: quickCount, preset: 'quick' })} />
              <PresetButton title="🎯 Entraînement" detail={`${standardCount} questions`} disabled={standardCount === 0} onClick={() => onStart({ count: standardCount, preset: 'training' })} />
              <PresetButton title="⏱ Examen blanc" detail={`${standardCount} questions · ${standardCount} min`} disabled={standardCount === 0} onClick={() => onStart({ count: standardCount, preset: 'mock', mode: 'exam', timeLimitSeconds: standardCount * SECONDS_PER_QUESTION })} />
              <PresetButton title="🧠 Adaptatif" detail="priorise tes besoins" disabled={standardCount === 0} onClick={() => onStart({ count: standardCount, preset: 'adaptive' })} />
              <PresetButton title="📉 Points faibles" detail="catégories à renforcer" disabled={standardCount === 0} onClick={() => onStart({ count: standardCount, preset: 'weak' })} />
            </div>
          </div>

          <div className="card setup-card custom-quiz-card">
            <p className="field-label">Quiz personnalisé</p>
            <button type="button" className="btn btn-primary" disabled={noQuestionsAvailable} onClick={startCustomQuiz}>
              Commencer le quiz
            </button>
          </div>
        </>
      )}

      <Terrain />

      <p className="footer-note">Questions issues du test théorique CDA — District Parisien de Football, saison 2026/2027. À but d'entraînement.</p>

      <button type="button" className="home-questions-link" onClick={onViewAnswers}>
        <span>
          <strong>Toutes les questions</strong>
          <small>Consulter les questions et les bonnes réponses</small>
        </span>
        <span className="home-questions-arrow" aria-hidden="true">→</span>
      </button>
    </div>
  )
}
