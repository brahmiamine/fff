import test from 'node:test'
import assert from 'node:assert/strict'
import {
  computeLearningSummary,
  loadLearningState,
  recordValidatedAttempt,
  saveLearningState,
  selectMistakeQuestions,
} from '../src/utils/learning.js'

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

const question = {
  id: 'lot3-test-1',
  category: 'Loi 12',
  type: 'single',
  question: 'Question test',
  correct: ['a'],
}

test('une réponse incorrecte validée est immédiatement enregistrée dans les erreurs du lot actif', () => {
  globalThis.localStorage = createLocalStorage()

  const state = recordValidatedAttempt(undefined, question, ['b'])
  saveLearningState(state, 'lot3')

  const lot3 = loadLearningState('lot3')
  const lot1 = loadLearningState('lot1')

  assert.equal(lot3.questions[question.id].lastResult, false)
  assert.equal(lot3.questions[question.id].wrongCount, 1)
  assert.deepEqual(lot3.validated, [question.id])
  assert.deepEqual(selectMistakeQuestions([question], lot3, 20).map((item) => item.id), [question.id])
  assert.equal(computeLearningSummary([question], lot3).mistakeCount, 1)
  assert.equal(lot1.questions[question.id], undefined)
})

test('une réponse correcte validée ensuite retire la question des erreurs sans effacer son historique', () => {
  let state = recordValidatedAttempt(undefined, question, ['b'])
  state = recordValidatedAttempt(state, question, ['a'])

  assert.equal(state.questions[question.id].lastResult, true)
  assert.equal(state.questions[question.id].wrongCount, 1)
  assert.equal(state.questions[question.id].correctCount, 1)
  assert.deepEqual(selectMistakeQuestions([question], state, 20), [])
})
