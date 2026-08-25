import test from 'node:test'
import assert from 'node:assert/strict'
import { isAnswerCorrect } from '../src/utils/answers.js'
import { getRemainingSeconds, pauseTimedState, resumeTimedState } from '../src/utils/session.js'
import {
  computeLearningSummary,
  recordQuizAttempts,
  selectAdaptiveQuestions,
  toggleFavorite,
} from '../src/utils/learning.js'

const questions = [
  { id: 'a', category: 'Loi 11', type: 'single', question: 'A', correct: ['1'] },
  { id: 'b', category: 'Loi 12', type: 'single', question: 'B', correct: ['1'] },
  { id: 'c', category: 'Loi 12', type: 'single', question: 'C', correct: ['1'] },
]

test('exact answer comparison ignores option order but rejects partial answers', () => {
  const question = { correct: ['b', 'a'] }
  assert.equal(isAnswerCorrect(question, ['a', 'b']), true)
  assert.equal(isAnswerCorrect(question, ['a']), false)
  assert.equal(isAnswerCorrect(question, ['a', 'b', 'c']), false)
})

test('explicit pause freezes the remaining time', () => {
  const state = { timeLimitSeconds: 600, deadlineAt: 1_000_000, remainingSeconds: 600 }
  const paused = pauseTimedState(state, 700_000)
  assert.equal(paused.remainingSeconds, 300)
  assert.equal(paused.deadlineAt, null)
  const resumed = resumeTimedState(paused, 900_000)
  assert.equal(resumed.deadlineAt, 1_200_000)
  assert.equal(getRemainingSeconds(resumed.deadlineAt, resumed.remainingSeconds, 900_000), 300)
})

test('recordQuizAttempts updates mastery and recent result without scheduling fields', () => {
  const now = Date.UTC(2026, 7, 25, 12)
  const state = recordQuizAttempts(undefined, questions.slice(0, 2), { a: ['1'], b: ['2'] }, now)
  assert.equal(state.questions.a.mastery, 1)
  assert.equal(state.questions.b.mastery, 0)
  assert.equal(state.questions.b.lastResult, false)
  assert.equal(state.questions.a.lastSeen, new Date(now).toISOString())
  assert.equal('dueAt' in state.questions.a, false)
  assert.equal('intervalDays' in state.questions.a, false)
  assert.equal('streak' in state.questions.a, false)
})

test('adaptive selection prioritizes unseen and weak/recently wrong questions', () => {
  const state = {
    favorites: [],
    questions: {
      a: { seenCount: 5, mastery: 1, lastResult: true },
      b: { seenCount: 3, mastery: 0.2, lastResult: false, wrongCount: 2 },
    },
  }
  const selected = selectAdaptiveQuestions(questions, state, 2)
  assert.deepEqual(selected.map((q) => q.id), ['b', 'c'])
})

test('summary and favorites expose actionable progress counts without due dates', () => {
  let state = recordQuizAttempts(undefined, questions.slice(0, 2), { a: ['1'], b: ['2'] })
  state = toggleFavorite(state, 'c')
  const summary = computeLearningSummary(questions, state)
  assert.equal(summary.seenQuestions, 2)
  assert.equal(summary.mistakeCount, 1)
  assert.equal(summary.favoriteCount, 1)
  assert.equal('dueCount' in summary, false)
})
