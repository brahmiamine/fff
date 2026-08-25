import test from 'node:test'
import assert from 'node:assert/strict'
import { isResumableProgress, loadProgress, saveProgress } from '../src/utils/storage.js'

const STORAGE_KEY = 'cda-quiz-progress-v1'
const questions = [
  { id: 'a', question: 'A' },
  { id: 'b', question: 'B' },
  { id: 'c', question: 'C' },
]

function createLocalStorage() {
  const values = new Map()
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

function progressAt(currentIndex, screen = 'quiz') {
  return {
    screen,
    quizQuestions: questions,
    answers: currentIndex > 0 ? { a: ['1'] } : {},
    currentIndex,
    timeLimitSeconds: null,
    deadlineAt: null,
    remainingSeconds: null,
    mode: 'training',
    preset: 'custom',
  }
}

test('question one is never resumable or persisted', () => {
  globalThis.localStorage = createLocalStorage()
  const state = progressAt(0)

  assert.equal(isResumableProgress(state), false)
  saveProgress(state)
  assert.equal(loadProgress(questions), null)
})

test('progress becomes resumable from question two', () => {
  globalThis.localStorage = createLocalStorage()
  const state = progressAt(1)

  assert.equal(isResumableProgress(state), true)
  saveProgress(state)

  const loaded = loadProgress(questions)
  assert.equal(loaded.currentIndex, 1)
  assert.deepEqual(loaded.answers, { a: ['1'] })
})

test('legacy first-question progress is ignored and removed', () => {
  globalThis.localStorage = createLocalStorage()
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressAt(0, 'home')))

  assert.equal(loadProgress(questions), null)
  assert.equal(globalThis.localStorage.getItem(STORAGE_KEY), null)
})
