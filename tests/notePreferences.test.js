import test from 'node:test'
import assert from 'node:assert/strict'
import {
  loadNoteOrder,
  loadOpenNoteIds,
  moveNote,
  NOTES_ORDER_STORAGE_KEY,
  OPEN_NOTES_STORAGE_KEY,
  reconcileNoteOrder,
  saveNoteOrder,
  saveOpenNoteIds,
} from '../src/utils/notePreferences.js'

function createLocalStorage() {
  const values = new Map()
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
  }
}

test('saved order is kept while removed notes are ignored and new notes are appended', () => {
  assert.deepEqual(
    reconcileNoteOrder(['a', 'b', 'c'], ['b', 'missing', 'a', 'b']),
    ['b', 'a', 'c'],
  )
})

test('a note can be moved before another note', () => {
  assert.deepEqual(moveNote(['a', 'b', 'c'], 'c', 'a'), ['c', 'a', 'b'])
  assert.deepEqual(moveNote(['a', 'b', 'c'], 'a', 'b'), ['b', 'a', 'c'])
})

test('open state and custom order are persisted in localStorage', () => {
  globalThis.localStorage = createLocalStorage()

  saveNoteOrder(['c', 'a', 'b'])
  saveOpenNoteIds(['a', 'c'])

  assert.equal(globalThis.localStorage.getItem(NOTES_ORDER_STORAGE_KEY), '["c","a","b"]')
  assert.equal(globalThis.localStorage.getItem(OPEN_NOTES_STORAGE_KEY), '["a","c"]')
  assert.deepEqual(loadNoteOrder(['a', 'b', 'c']), ['c', 'a', 'b'])
  assert.deepEqual(loadOpenNoteIds(['a', 'b', 'c']), ['a', 'c'])
})

test('invalid stored preferences fall back to collapsed notes in source order', () => {
  globalThis.localStorage = createLocalStorage()
  globalThis.localStorage.setItem(NOTES_ORDER_STORAGE_KEY, '{invalid')
  globalThis.localStorage.setItem(OPEN_NOTES_STORAGE_KEY, 'not-an-array')

  assert.deepEqual(loadNoteOrder(['a', 'b']), ['a', 'b'])
  assert.deepEqual(loadOpenNoteIds(['a', 'b']), [])
})
