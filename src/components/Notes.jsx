import { useEffect, useMemo, useRef, useState } from 'react'
import NOTES from '../data/notes.json'
import {
  loadNoteOrder,
  loadOpenNoteIds,
  moveNote,
  saveNoteOrder,
  saveOpenNoteIds,
} from '../utils/notePreferences.js'
import QuestionMedia from './QuestionMedia.jsx'
import Terrain from './Terrain.jsx'

const VISIBLE_NOTES = NOTES.filter((note) => note.id !== 'main-position-du-bras')

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
  const noteIds = useMemo(() => VISIBLE_NOTES.map((note) => note.id), [])
  const notesById = useMemo(() => new Map(VISIBLE_NOTES.map((note) => [note.id, note])), [])
  const [noteOrder, setNoteOrder] = useState(() => loadNoteOrder(noteIds))
  const [openNoteIds, setOpenNoteIds] = useState(() => new Set(loadOpenNoteIds(noteIds)))
  const [draggedNoteId, setDraggedNoteId] = useState(null)
  const dragState = useRef(null)

  useEffect(() => {
    saveNoteOrder(noteOrder)
  }, [noteOrder])

  useEffect(() => {
    saveOpenNoteIds([...openNoteIds])
  }, [openNoteIds])

  const orderedNotes = noteOrder.map((id) => notesById.get(id)).filter(Boolean)

  function toggleNote(noteId) {
    setOpenNoteIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(noteId)) nextIds.delete(noteId)
      else nextIds.add(noteId)
      return nextIds
    })
  }

  function startDragging(event, noteId) {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    dragState.current = {
      noteId,
      overId: noteId,
      pointerId: event.pointerId,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDraggedNoteId(noteId)
  }

  function dragNote(event) {
    const currentDrag = dragState.current
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) return

    const edgeSize = 72
    if (event.clientY < edgeSize) window.scrollBy(0, -12)
    else if (event.clientY > window.innerHeight - edgeSize) window.scrollBy(0, 12)

    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-note-id]')
    const targetId = target?.dataset.noteId

    if (!targetId || targetId === currentDrag.noteId || targetId === currentDrag.overId) return

    currentDrag.overId = targetId
    setNoteOrder((currentOrder) => moveNote(currentOrder, currentDrag.noteId, targetId))
  }

  function stopDragging(event) {
    if (dragState.current?.pointerId !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragState.current = null
    setDraggedNoteId(null)
  }

  function moveNoteWithKeyboard(event, noteId) {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return

    const currentIndex = noteOrder.indexOf(noteId)
    const targetIndex = event.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= noteOrder.length) return

    event.preventDefault()
    setNoteOrder((currentOrder) => moveNote(currentOrder, noteId, currentOrder[targetIndex]))
  }

  return (
    <div className="screen collection-screen notes-screen">
      <div className="collection-heading">
        <h1 className="app-title">Mes notes</h1>
        <p className="app-subtitle">Définitions et rappels utiles pour l’arbitrage</p>
      </div>

      <div className="review-list notes-list">
        {orderedNotes.map((note) => {
          const isOpen = openNoteIds.has(note.id)
          const panelId = `note-panel-${note.id}`

          return (
            <article
              key={note.id}
              data-note-id={note.id}
              className={`card collection-item note-collapse ${
                draggedNoteId === note.id ? 'note-collapse-dragging' : ''
              }`}
            >
              <div className="note-collapse-header">
                <button
                  type="button"
                  className="note-drag-handle"
                  aria-label={`Déplacer la note ${note.title}`}
                  title="Maintenir et glisser pour déplacer"
                  onPointerDown={(event) => startDragging(event, note.id)}
                  onPointerMove={dragNote}
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  onKeyDown={(event) => moveNoteWithKeyboard(event, note.id)}
                >
                  <span aria-hidden="true">⠿</span>
                </button>

                <h2 className="note-collapse-heading">
                  <button
                    type="button"
                    className="note-collapse-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleNote(note.id)}
                  >
                    <span className="note-collapse-title">{note.title}</span>
                  </button>
                </h2>
              </div>

              {isOpen && (
                <div id={panelId} className="note-collapse-content">
                  <div className="collection-item-meta">
                    <span className="badge badge-law">{note.law}</span>
                    <span className="badge">{note.type || 'Note'}</span>
                  </div>

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
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
