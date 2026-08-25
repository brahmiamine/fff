const NAV_ITEMS = [
  {
    screen: 'home',
    label: 'Accueil',
    icon: (
      <>
        <path d="m3 10.8 9-7.8 9 7.8" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
  {
    screen: 'memorized',
    label: 'Mémoriser',
    icon: (
      <>
        <path d="M6 4h12v16l-6-3-6 3V4Z" />
        <path d="m9 10 2 2 4-4" />
      </>
    ),
  },
  {
    screen: 'favorites',
    label: 'Favoris',
    icon: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2-4.5-4.4 6.2-.9L12 3Z" />
    ),
  },
  {
    screen: 'mistakes',
    label: 'Erreurs',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </>
    ),
  },
  {
    screen: 'statistics',
    label: 'Statistiques',
    icon: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19H2" />
      </>
    ),
  },
]

export default function BottomNav({ activeScreen, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {NAV_ITEMS.map((item) => {
        const active = activeScreen === item.screen
        return (
          <button
            type="button"
            key={item.screen}
            className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`}
            onClick={() => onNavigate(item.screen)}
            aria-current={active ? 'page' : undefined}
          >
            <svg
              className="bottom-nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
