import test from 'node:test'
import assert from 'node:assert/strict'
import { loadHistory, addHistoryEntry } from '../src/utils/history.js'
import { emptyLearningState, loadLearningState, saveLearningState } from '../src/utils/learning.js'
import { loadProgress, saveProgress } from '../src/utils/storage.js'

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

test('historique et apprentissage restent séparés par lot', () => {
  globalThis.localStorage = createLocalStorage()

  addHistoryEntry({ date: '2026-01-01', scoreTotal: 90 }, 'lot1')
  addHistoryEntry({ date: '2026-01-02', scoreTotal: 40 }, 'lot2')

  assert.equal(loadHistory('lot1')[0].scoreTotal, 90)
  assert.equal(loadHistory('lot2')[0].scoreTotal, 40)

  saveLearningState({ ...emptyLearningState(), favorites: ['q-lot1'] }, 'lot1')
  saveLearningState({ ...emptyLearningState(), favorites: ['q-lot2'] }, 'lot2')

  assert.deepEqual(loadLearningState('lot1').favorites, ['q-lot1'])
  assert.deepEqual(loadLearningState('lot2').favorites, ['q-lot2'])
})

test('une progression sauvegardée dans un lot ne fuit pas dans l’autre', () => {
  globalThis.localStorage = createLocalStorage()
  const lot1Questions = [{ id: 'a' }, { id: 'b' }]
  const lot2Questions = [{ id: 'x' }, { id: 'y' }]
  const progress = {
    screen: 'quiz',
    quizQuestions: lot1Questions,
    answers: { a: ['1'] },
    currentIndex: 1,
    timeLimitSeconds: null,
    deadlineAt: null,
    remainingSeconds: null,
    mode: 'training',
    preset: 'custom',
  }

  saveProgress(progress, 'lot1')

  assert.equal(loadProgress(lot1Questions, 'lot1').currentIndex, 1)
  assert.equal(loadProgress(lot2Questions, 'lot2'), null)
})
