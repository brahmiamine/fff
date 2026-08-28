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
    screen: 'reviews',
    label: 'Révisions',
    icon: (
      <>
        <path d="M6 4h12v16l-6-3-6 3V4Z" />
        <path d="m9 10 2 2 4-4" />
      </>
    ),
  },
  {
    screen: 'documents',
    label: 'Mes documents',
    icon: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h6M9 16h6" />
      </>
    ),
  },
  {
    screen: 'statistics',
    label: 'Statistiques',
    icon: (
      <>
        <path d="M4 20V11h4v9" />
        <path d="M10 20V5h4v15" />
        <path d="M16 20v-7h4v7" />
      </>
    ),
  },
  {
    screen: 'settings',
    label: 'Paramètres',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
  },
]

const REVIEW_SUBPAGES = new Set(['favorites', 'mistakes', 'unvalidated'])
const SETTINGS_SUBPAGES = new Set(['answers'])

export default function BottomNav({ activeScreen, onNavigate }) {
  function handleNavigate(screen) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    onNavigate(screen)
  }

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {NAV_ITEMS.map((item) => {
        const active = activeScreen === item.screen
          || (item.screen === 'reviews' && REVIEW_SUBPAGES.has(activeScreen))
          || (item.screen === 'settings' && SETTINGS_SUBPAGES.has(activeScreen))
        return (
          <button
            type="button"
            key={item.screen}
            className={`bottom-nav-item ${active ? 'bottom-nav-item-active' : ''}`}
            onClick={() => handleNavigate(item.screen)}
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
