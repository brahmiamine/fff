import { useMemo, useState } from 'react'
import NOTE_SITES from '../data/noteSites.json'

export default function Notes() {
  const [activeSiteId, setActiveSiteId] = useState(() => NOTE_SITES[0]?.id ?? null)
  const activeSite = useMemo(
    () => NOTE_SITES.find((site) => site.id === activeSiteId) ?? NOTE_SITES[0] ?? null,
    [activeSiteId],
  )

  if (!activeSite) {
    return (
      <div className="screen collection-screen notes-screen">
        <div className="collection-heading">
          <h1 className="app-title">Mes notes</h1>
        </div>
        <div className="card notes-empty">Aucun site configuré.</div>
      </div>
    )
  }

  return (
    <div className="screen collection-screen notes-screen">
      <div className="notes-web-header">
        <h1 className="app-title">Mes notes</h1>

        {NOTE_SITES.length > 1 && (
          <div className="notes-site-tabs" role="tablist" aria-label="Sites de notes">
            {NOTE_SITES.map((site) => (
              <button
                key={site.id}
                type="button"
                role="tab"
                aria-selected={site.id === activeSite.id}
                className={`notes-site-tab ${site.id === activeSite.id ? 'is-active' : ''}`}
                onClick={() => setActiveSiteId(site.id)}
              >
                {site.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="notes-site-shell" aria-label={activeSite.title}>
        <div className="notes-site-toolbar">
          <strong>{activeSite.title}</strong>
          <a
            className="notes-site-open"
            href={activeSite.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Ouvrir ${activeSite.title} dans un nouvel onglet`}
          >
            Ouvrir ↗
          </a>
        </div>

        <iframe
          key={activeSite.id}
          className="notes-site-frame"
          src={activeSite.embedUrl || activeSite.url}
          title={activeSite.title}
          loading="eager"
          allow="clipboard-write; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
    </div>
  )
}
