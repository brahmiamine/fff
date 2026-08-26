import NOTES from '../data/notes.json'
import QuestionMedia from './QuestionMedia.jsx'
import Terrain from './Terrain.jsx'

function renderInlineMarkdown(text, keyPrefix = 'inline') {
  const tokens = text.split(/(\*\*.+?\*\*|==.+?==|`.+?`|\*[^*]+?\*)/g)

  return tokens.filter(Boolean).map((token, index) => {
    const key = `${keyPrefix}-${index}`

    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={key}>{token.slice(2, -2)}</strong>
    }

    if (token.startsWith('==') && token.endsWith('==')) {
      return <mark key={key}>{token.slice(2, -2)}</mark>
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={key}>{token.slice(1, -1)}</code>
    }

    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={key}>{token.slice(1, -1)}</em>
    }

    return token
  })
}

function MarkdownNote({ content, accent = 'blue' }) {
  if (!content?.trim()) return null

  const lines = content.split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    if (/^#{1,6}\s+/.test(line)) {
      const text = line.replace(/^#{1,6}\s+/, '')
      blocks.push(
        <h3 key={`heading-${index}`} className="note-markdown-heading">
          {renderInlineMarkdown(text, `heading-${index}`)}
        </h3>,
      )
      index += 1
      continue
    }

    if (line.startsWith('- ')) {
      const items = []
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        const item = lines[index].trim().slice(2)
        items.push(
          <li key={`item-${index}`}>{renderInlineMarkdown(item, `item-${index}`)}</li>,
        )
        index += 1
      }
      blocks.push(<ul key={`list-${index}`}>{items}</ul>)
      continue
    }

    if (line.startsWith('> ')) {
      const quote = []
      while (index < lines.length && lines[index].trim().startsWith('> ')) {
        quote.push(lines[index].trim().slice(2))
        index += 1
      }
      blocks.push(
        <blockquote key={`quote-${index}`}>
          {renderInlineMarkdown(quote.join(' '), `quote-${index}`)}
        </blockquote>,
      )
      continue
    }

    const paragraph = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith('- ') &&
      !lines[index].trim().startsWith('> ')
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }

    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInlineMarkdown(paragraph.join(' '), `paragraph-${index}`)}
      </p>,
    )
  }

  return <div className={`note-markdown note-markdown-${accent}`}>{blocks}</div>
}

export default function Notes() {
  return (
    <div className="screen collection-screen notes-screen">
      <div className="collection-heading">
        <h1 className="app-title">Mes notes</h1>
        <p className="app-subtitle">Définitions et rappels utiles pour l’arbitrage</p>
      </div>

      <div className="review-list">
        {NOTES.map((note, index) => (
          <article key={note.id} className="card collection-item">
            <div className="collection-item-meta">
              <span className="badge badge-law">{note.law}</span>
              <span className="badge">{note.type || 'Note'}</span>
            </div>

            <p className="review-number">Note {index + 1}</p>
            <h2 className="review-question">{note.title}</h2>
            {note.subtitle && <p className="collection-note">{note.subtitle}</p>}

            {note.markdown ? (
              <MarkdownNote content={note.markdown} accent={note.accent} />
            ) : (
              (note.paragraphs || []).map((paragraph) => (
                <p key={paragraph} className="review-explanation">{paragraph}</p>
              ))
            )}

            {(note.image || note.video) && (
              <QuestionMedia
                question={{
                  ...note,
                  question: note.title,
                }}
                compact
              />
            )}

            {note.special === 'terrain' && <Terrain embedded />}

            <p className="collection-note">Référence : {note.law} — {note.reference}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
