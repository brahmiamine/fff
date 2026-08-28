import fffLogo from '../assets/fff-logo.png'
import district75Logo from '../assets/district75-logo.png'
import { resolveDefaultQuestionCount } from '../utils/settings.js'

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
  settings,
}) {
  const totalQuestions = allQuestions.length

  function handleReset() {
    if (window.confirm('Réinitialiser le quiz en cours ?')) onReset()
  }

  const standardCount = resolveDefaultQuestionCount(settings.defaultQuestionCount, totalQuestions)
  const quickCount = Math.min(10, totalQuestions)
  const noQuestionsAvailable = totalQuestions === 0
  const questionTimeSeconds = settings.questionTimeSeconds
  const standardTimeLimit = settings.defaultTimed ? standardCount * questionTimeSeconds : null
  const quickTimeLimit = settings.defaultTimed ? quickCount * questionTimeSeconds : null
  const isExamMode = settings.defaultMode === 'exam'

  function startCustomQuiz() {
    onStart({
      count: standardCount,
      category: 'all',
      mode: settings.defaultMode,
      preset: 'custom',
      timeLimitSeconds: standardTimeLimit,
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
          <div className="card setup-card">
            <p className="field-label">Choisir un entraînement</p>
            <div className="preset-grid">
              <PresetButton
                title={isExamMode ? '⚡ Examen rapide' : '⚡ Quiz rapide'}
                detail={`${quickCount} questions`}
                disabled={quickCount === 0}
                onClick={() => onStart({
                  count: quickCount,
                  preset: 'quick',
                  mode: settings.defaultMode,
                  timeLimitSeconds: quickTimeLimit,
                })}
              />
              <PresetButton
                title={isExamMode ? '🎯 Examen' : '🎯 Entraînement'}
                detail={`${standardCount} questions`}
                disabled={standardCount === 0}
                onClick={() => onStart({
                  count: standardCount,
                  preset: 'training',
                  mode: settings.defaultMode,
                  timeLimitSeconds: standardTimeLimit,
                })}
              />
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

      <p className="footer-note">Questions issues du test théorique CDA — District Parisien de Football, saison 2026/2027. À but d'entraînement.</p>
    </div>
  )
}
