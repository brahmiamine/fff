import test from 'node:test'
import assert from 'node:assert/strict'
import { isAnswerCorrect } from '../src/utils/answers.js'
import { getRemainingSeconds, pauseTimedState, resumeTimedState } from '../src/utils/session.js'
import {
  computeLearningSummary,
  nextIntervalDays,
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

test('spaced repetition grows after consecutive correct answers and resets after an error', () => {
  assert.equal(nextIntervalDays({ streak: 0 }, true), 1)
  assert.equal(nextIntervalDays({ streak: 1 }, true), 3)
  assert.equal(nextIntervalDays({ streak: 2 }, true), 7)
  assert.equal(nextIntervalDays({ streak: 8 }, true), 30)
  assert.equal(nextIntervalDays({ streak: 8 }, false), 1)
})

test('recordQuizAttempts updates mastery, due date and recent result', () => {
  const now = Date.UTC(2026, 7, 25, 12)
  const state = recordQuizAttempts(undefined, questions.slice(0, 2), { a: ['1'], b: ['2'] }, now)
  assert.equal(state.questions.a.mastery, 1)
  assert.equal(state.questions.a.streak, 1)
  assert.equal(state.questions.b.mastery, 0)
  assert.equal(state.questions.b.lastResult, false)
  assert.equal(state.questions.b.intervalDays, 1)
})

test('adaptive selection prioritizes unseen and weak/recently wrong questions', () => {
  const now = Date.UTC(2026, 7, 25, 12)
  const state = {
    favorites: [],
    questions: {
      a: { seenCount: 5, mastery: 1, lastResult: true, dueAt: new Date(now + 86400000).toISOString() },
      b: { seenCount: 3, mastery: 0.2, lastResult: false, wrongCount: 2, dueAt: new Date(now - 1000).toISOString() },
    },
  }
  const selected = selectAdaptiveQuestions(questions, state, 2, now)
  assert.deepEqual(selected.map((q) => q.id), ['b', 'c'])
})

test('summary and favorites expose actionable progress counts', () => {
  const now = Date.UTC(2026, 7, 25, 12)
  let state = recordQuizAttempts(undefined, questions.slice(0, 2), { a: ['1'], b: ['2'] }, now - 2 * 86400000)
  state = toggleFavorite(state, 'c')
  const summary = computeLearningSummary(questions, state, now)
  assert.equal(summary.seenQuestions, 2)
  assert.equal(summary.mistakeCount, 1)
  assert.equal(summary.favoriteCount, 1)
  assert.equal(summary.dueCount, 2)
})
