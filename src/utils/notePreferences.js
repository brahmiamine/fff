export const NOTES_ORDER_STORAGE_KEY = 'cda-notes-order-v1'
export const OPEN_NOTES_STORAGE_KEY = 'cda-notes-open-v1'

function readStoredArray(key) {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeStoredArray(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage can be unavailable in private browsing or when the quota is full.
  }
}

export function reconcileNoteOrder(noteIds, storedOrder = []) {
  const availableIds = new Set(noteIds)
  const seenIds = new Set()
  const order = []

  storedOrder.forEach((id) => {
    if (availableIds.has(id) && !seenIds.has(id)) {
      order.push(id)
      seenIds.add(id)
    }
  })

  noteIds.forEach((id) => {
    if (!seenIds.has(id)) order.push(id)
  })

  return order
}

export function moveNote(order, activeId, targetId) {
  const activeIndex = order.indexOf(activeId)
  const targetIndex = order.indexOf(targetId)

  if (activeIndex === -1 || targetIndex === -1 || activeIndex === targetIndex) {
    return order
  }

  const nextOrder = [...order]
  const [activeNote] = nextOrder.splice(activeIndex, 1)
  nextOrder.splice(targetIndex, 0, activeNote)
  return nextOrder
}

export function loadNoteOrder(noteIds) {
  return reconcileNoteOrder(noteIds, readStoredArray(NOTES_ORDER_STORAGE_KEY))
}

export function saveNoteOrder(order) {
  writeStoredArray(NOTES_ORDER_STORAGE_KEY, order)
}

export function loadOpenNoteIds(noteIds) {
  const availableIds = new Set(noteIds)
  return readStoredArray(OPEN_NOTES_STORAGE_KEY).filter((id) => availableIds.has(id))
}

export function saveOpenNoteIds(openIds) {
  writeStoredArray(OPEN_NOTES_STORAGE_KEY, openIds)
}
