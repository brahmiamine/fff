const COUNT_OPTIONS = [10, 20, 30, 'all']

function ToggleSetting({ checked, onChange, label, description }) {
  return (
    <label className="settings-toggle-row">
      <span className="settings-toggle-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="settings-switch">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className="settings-switch-track" aria-hidden="true"><span /></span>
      </span>
    </label>
  )
}

export default function Settings({
  settings,
  onChange,
  onViewStatistics,
  onResetAll,
  historyCount,
  learningSummary,
}) {
  function handleResetAll() {
    const confirmed = window.confirm(
      'Réinitialiser toutes les données ? Les quiz en cours, statistiques, favoris, erreurs, questions mémorisées et paramètres seront effacés.',
    )
    if (confirmed) onResetAll()
  }

  return (
    <div className="screen settings-screen">
      <div className="settings-heading">
        <h1 className="app-title">Paramètres</h1>
        <p className="app-subtitle">Personnalise ton entraînement et l’affichage</p>
      </div>

      <section className="card settings-card" aria-labelledby="settings-quiz-title">
        <div className="settings-section-heading">
          <h2 id="settings-quiz-title">Quiz par défaut</h2>
          <p>Ces choix préremplissent l’accueil.</p>
        </div>

        <label className="settings-field">
          <span>
            <strong>Nombre de questions</strong>
            <small>Utilisé pour les entraînements standards et le quiz personnalisé.</small>
          </span>
          <select
            className="settings-select"
            value={settings.defaultQuestionCount}
            onChange={(event) => onChange({ defaultQuestionCount: event.target.value === 'all' ? 'all' : Number(event.target.value) })}
          >
            {COUNT_OPTIONS.map((value) => (
              <option key={value} value={value}>{value === 'all' ? 'Toutes' : value}</option>
            ))}
          </select>
        </label>

        <div className="settings-field settings-field-stacked">
          <span>
            <strong>Mode par défaut</strong>
            <small>Choix initial du quiz personnalisé.</small>
          </span>
          <div className="settings-segmented" role="group" aria-label="Mode par défaut">
            <button
              type="button"
              className={settings.defaultMode === 'training' ? 'settings-segment-active' : ''}
              onClick={() => onChange({ defaultMode: 'training' })}
            >
              Entraînement
            </button>
            <button
              type="button"
              className={settings.defaultMode === 'exam' ? 'settings-segment-active' : ''}
              onClick={() => onChange({ defaultMode: 'exam' })}
            >
              Examen
            </button>
          </div>
        </div>

        <ToggleSetting
          checked={settings.defaultTimed}
          onChange={(value) => onChange({ defaultTimed: value })}
          label="Chrono par défaut"
          description="Active automatiquement le chrono dans le quiz personnalisé."
        />
      </section>

      <section className="card settings-card" aria-labelledby="settings-correction-title">
        <div className="settings-section-heading">
          <h2 id="settings-correction-title">Correction</h2>
        </div>
        <ToggleSetting
          checked={settings.showExplanations}
          onChange={(value) => onChange({ showExplanations: value })}
          label="Afficher les explications"
          description="Affiche le texte explicatif dans les corrections et les questions mémorisées."
        />
      </section>

      <section className="card settings-card" aria-labelledby="settings-theme-title">
        <div className="settings-section-heading">
          <h2 id="settings-theme-title">Apparence</h2>
        </div>
        <div className="settings-field settings-field-stacked">
          <span>
            <strong>Thème</strong>
            <small>Le mode système suit automatiquement ton téléphone.</small>
          </span>
          <div className="settings-segmented settings-theme-options" role="group" aria-label="Thème de l’application">
            <button type="button" className={settings.theme === 'system' ? 'settings-segment-active' : ''} onClick={() => onChange({ theme: 'system' })}>Système</button>
            <button type="button" className={settings.theme === 'light' ? 'settings-segment-active' : ''} onClick={() => onChange({ theme: 'light' })}>Clair</button>
            <button type="button" className={settings.theme === 'dark' ? 'settings-segment-active' : ''} onClick={() => onChange({ theme: 'dark' })}>Sombre</button>
          </div>
        </div>
      </section>

      <button type="button" className="settings-link-card" onClick={onViewStatistics}>
        <span className="settings-link-icon" aria-hidden="true">▥</span>
        <span className="settings-link-copy">
          <strong>Statistiques</strong>
          <small>{historyCount} quiz terminé{historyCount > 1 ? 's' : ''} · {learningSummary.seenQuestions} question{learningSummary.seenQuestions > 1 ? 's' : ''} vue{learningSummary.seenQuestions > 1 ? 's' : ''}</small>
        </span>
        <span className="settings-link-arrow" aria-hidden="true">→</span>
      </button>

      <section className="card settings-card settings-danger-card" aria-labelledby="settings-data-title">
        <div className="settings-section-heading">
          <h2 id="settings-data-title">Données</h2>
          <p>À utiliser uniquement si tu veux repartir de zéro.</p>
        </div>
        <button type="button" className="settings-reset-button" onClick={handleResetAll}>
          Réinitialiser toutes les données
        </button>
      </section>
    </div>
  )
}
