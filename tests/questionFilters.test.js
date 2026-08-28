import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterQuestionList,
  getQuestionFilterOptions,
  selectUnvalidatedQuestions,
} from '../src/utils/questionFilters.js'

const questions = [
  {
    id: 'q1',
    question: 'Un attaquant est-il en position de hors-jeu ?',
    category: 'Hors-jeu',
    law: 'Loi 11',
    difficulty: 'standard',
    image: 'images/hors-jeu.webp',
    video: null,
    explanation: 'Observer la position au moment de la passe.',
    tags: ['position'],
    options: [{ id: 'a', text: 'Oui' }, { id: 'b', text: 'Non' }],
  },
  {
    id: 'q2',
    question: 'Quelle décision après une faute imprudente ?',
    category: 'Fautes',
    law: 'Loi 12',
    difficulty: 'difficile',
    image: null,
    video: 'https://example.com/faute.mp4',
    explanation: 'Identifier la nature de la faute.',
    tags: ['sanction'],
    options: [{ id: 'a', text: 'Coup franc direct' }],
  },
  {
    id: 'q3',
    question: 'Quelle est la largeur du terrain ?',
    category: 'Terrain',
    law: 'Loi 1',
    difficulty: 'facile',
    image: null,
    video: null,
    explanation: '',
    tags: [],
    options: [{ id: 'a', text: '45 à 90 mètres' }],
  },
]

test('text search is accent-insensitive and includes answer text', () => {
  assert.deepEqual(filterQuestionList(questions, { query: 'hors jeu' }).map((q) => q.id), ['q1'])
  assert.deepEqual(filterQuestionList(questions, { query: 'metres' }).map((q) => q.id), ['q3'])
  assert.deepEqual(filterQuestionList(questions, { query: 'coup franc direct' }).map((q) => q.id), ['q2'])
})

test('law, difficulty, category, media and validation filters combine', () => {
  const result = filterQuestionList(questions, {
    law: 'Loi 12',
    difficulty: 'difficile',
    category: 'Fautes',
    media: 'video',
    validation: 'unvalidated',
  }, ['q1'])

  assert.deepEqual(result.map((q) => q.id), ['q2'])
})

test('image and validated filters select the expected questions', () => {
  assert.deepEqual(filterQuestionList(questions, { media: 'image' }).map((q) => q.id), ['q1'])
  assert.deepEqual(filterQuestionList(questions, { validation: 'validated' }, ['q1', 'q3']).map((q) => q.id), ['q1', 'q3'])
})

test('filter options are derived from the question bank', () => {
  assert.deepEqual(getQuestionFilterOptions(questions), {
    laws: ['Loi 1', 'Loi 11', 'Loi 12'],
    difficulties: ['difficile', 'facile', 'standard'],
    categories: ['Fautes', 'Hors-jeu', 'Terrain'],
  })
})

test('unvalidated selection excludes only validated questions', () => {
  assert.deepEqual(selectUnvalidatedQuestions(questions, ['q1']).map((q) => q.id), ['q2', 'q3'])
})
