export default function ReviewsHub({
  favoriteCount,
  mistakeCount,
  neverValidatedCount,
  onOpenFavorites,
  onOpenMistakes,
  onOpenUnvalidated,
}) {
  const items = [
    {
      key: 'favorites',
      icon: '★',
      title: 'Mes favoris',
      description: `${favoriteCount} question${favoriteCount > 1 ? 's' : ''} enregistrée${favoriteCount > 1 ? 's' : ''}`,
      onClick: onOpenFavorites,
    },
    {
      key: 'mistakes',
      icon: '×',
      title: 'Mes erreurs',
      description: `${mistakeCount} question${mistakeCount > 1 ? 's' : ''} à corriger`,
      onClick: onOpenMistakes,
    },
    {
      key: 'unvalidated',
      icon: '?',
      title: 'Questions jamais validées',
      description: `${neverValidatedCount} question${neverValidatedCount > 1 ? 's' : ''} à valider au moins une fois`,
      onClick: onOpenUnvalidated,
    },
  ]

  return (
    <div className="screen collection-screen reviews-hub-screen">
      <div className="collection-heading">
        <h1 className="app-title">Révisions</h1>
        <p className="app-subtitle">Retrouve tes favoris, tes erreurs et les questions à valider</p>
      </div>

      {items.map((item) => (
        <button type="button" className="settings-link-card" key={item.key} onClick={item.onClick}>
          <span className="settings-link-icon" aria-hidden="true">{item.icon}</span>
          <span className="settings-link-copy">
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </span>
          <span className="settings-link-arrow" aria-hidden="true">→</span>
        </button>
      ))}
    </div>
  )
}
