import test from 'node:test'
import assert from 'node:assert/strict'
import {
  FOOTBALL_ABBREVIATIONS,
  abbreviateFootballText,
  abbreviateQuestion,
} from '../src/data/abbreviations.js'

test('exposes the referee abbreviations requested for the quiz help modal', () => {
  assert.deepEqual(
    FOOTBALL_ABBREVIATIONS.map(({ code }) => code),
    ['SRA', 'CFI', 'CFD', 'HJ', 'SDR', 'SB', 'BAT', 'PY', 'RT', 'SRCP LOI 8', 'SRCP LOI 13', 'MEG', 'AVT', 'EXC', 'CAS', 'RCC'],
  )
})

test('abbreviates football exam terminology without changing the meaning', () => {
  const text = "Penalty dans la surface de réparation : coup franc indirect, avertissement pour comportement antisportif (CAS) et rapport."
  assert.equal(
    abbreviateFootballText(text),
    'PY dans la SDR : CFI, AVT pour CAS et RCC.',
  )
})

test('uses SRA only for advantage wording that describes the referee decision', () => {
  assert.equal(abbreviateFootballText("Sous le principe de l’avantage"), 'SRA')
  assert.equal(abbreviateFootballText("L’arbitre laisse jouer (avantage)"), 'L’arbitre laisse jouer SRA')
  assert.equal(abbreviateFootballText("L’arbitre peut laisser jouer l’avantage"), 'L’arbitre peut laisser jouer SRA')
  assert.equal(abbreviateFootballText("un attaquant tire un avantage de sa position"), "un attaquant tire un avantage de sa position")
})

test('collapses existing expanded shorthand and removes unsupported ADJ', () => {
  assert.equal(abbreviateFootballText('MEG (mise en garde) du gardien'), 'MEG du gardien')
  assert.equal(abbreviateFootballText('AVT pour CAS (avertissement pour comportement antisportif)'), 'AVT pour CAS')
  assert.equal(abbreviateFootballText('ADJ (arrêt du jeu)'), 'Arrêt du jeu')
  assert.equal(abbreviateFootballText('PY à retirer (le penalty doit être retiré)'), 'PY à retirer')
})

test('abbreviates question and answer labels but preserves correct answer ids', () => {
  const source = {
    id: 'sample',
    question: 'Une infraction de hors-jeu dans la surface de réparation : décision ?',
    options: [
      { id: 'a', text: 'Coup franc indirect' },
      { id: 'b', text: 'Penalty' },
    ],
    correct: ['a'],
  }

  const result = abbreviateQuestion(source)
  assert.equal(result.question, 'Une infraction de HJ dans la SDR : décision ?')
  assert.deepEqual(result.options.map(({ text }) => text), ['CFI', 'PY'])
  assert.deepEqual(result.correct, ['a'])
  assert.deepEqual(source.correct, ['a'])
})
