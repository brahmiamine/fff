const NAV_ITEMS = [
  {
    screen: 'home',
    label: 'Accueil',
    icon: (
      <path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5H15v-6H9v6H3.5a.5.5 0 0 1-.5-.5v-9.7Z" />
    ),
  },
  {
    screen: 'history',
    label: 'Progression',
    icon: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19H2" />
      </>
    ),
  },
  {
    screen: 'answers',
    label: 'Questions',
    icon: (
      <>
        <path d="M5 4h11a3 3 0 0 1 3 3v13H7a2 2 0 0 1-2-2V4Z" />
        <path d="M7 20V7a3 3 0 0 1 3-3" />
        <path d="M10 9h6" />
        <path d="M10 13h5" />
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
