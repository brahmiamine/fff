#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { isSafeMediaReference } from '../src/utils/media.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'src', 'data')
const questionFiles = readdirSync(dataDir)
  .filter((fileName) => /^questions-lot\d+\.json$/.test(fileName))
  .sort((a, b) => {
    const aNumber = Number(a.match(/\d+/)?.[0] || 0)
    const bNumber = Number(b.match(/\d+/)?.[0] || 0)
    return aNumber - bNumber
  })
let hasErrors = false

function validateFile(fileName) {
  const filePath = path.join(dataDir, fileName)
  let questions

  try {
    questions = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (err) {
    console.error(`✗ ${fileName} is not valid JSON: ${err.message}`)
    hasErrors = true
    return
  }

  const errors = []

  if (!Array.isArray(questions) || questions.length === 0) {
    errors.push('the file must contain a non-empty array')
  }

  const seenIds = new Set()

  questions.forEach((q, index) => {
    const where = `Question #${index + 1} (id: ${q?.id ?? '?'})`

    if (!q.id || typeof q.id !== 'string') {
      errors.push(`${where}: missing or invalid "id"`)
    } else if (seenIds.has(q.id)) {
      errors.push(`${where}: duplicate id "${q.id}"`)
    } else {
      seenIds.add(q.id)
    }

    if (!q.category || typeof q.category !== 'string') errors.push(`${where}: missing "category"`)
    if (!['single', 'multiple'].includes(q.type)) {
      errors.push(`${where}: "type" must be "single" or "multiple", got ${JSON.stringify(q.type)}`)
    }
    if (!q.question || typeof q.question !== 'string') errors.push(`${where}: missing "question" text`)
    if (!q.explanation || typeof q.explanation !== 'string') errors.push(`${where}: missing "explanation"`)
    if (q.image !== null && q.image !== undefined && typeof q.image !== 'string') {
      errors.push(`${where}: "image" must be null or a string path`)
    }
    if (q.video !== null && q.video !== undefined) {
      if (typeof q.video !== 'string' || !isSafeMediaReference(q.video)) {
        errors.push(`${where}: "video" must be null or a safe http(s) URL / local path`)
      }
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`${where}: needs at least 2 "options"`)
    } else {
      const optionIds = q.options.map((o) => o?.id)
      const dupOptions = optionIds.filter((id, i) => optionIds.indexOf(id) !== i)
      if (dupOptions.length > 0) {
        errors.push(`${where}: duplicate option ids ${[...new Set(dupOptions)].join(', ')}`)
      }

      q.options.forEach((o, i) => {
        if (!o.id || typeof o.id !== 'string') errors.push(`${where}: option #${i + 1} missing "id"`)
        if (!o.text || typeof o.text !== 'string') errors.push(`${where}: option #${i + 1} missing "text"`)
      })

      if (!Array.isArray(q.correct) || q.correct.length === 0) {
        errors.push(`${where}: "correct" must be a non-empty array`)
      } else {
        q.correct.forEach((c) => {
          if (!optionIds.includes(c)) {
            errors.push(`${where}: "correct" references unknown option id "${c}"`)
          }
        })
        if (q.type === 'single' && q.correct.length !== 1) {
          errors.push(`${where}: "single" type must have exactly 1 correct answer, has ${q.correct.length}`)
        }
      }
    }
  })

  if (errors.length > 0) {
    hasErrors = true
    console.error(`✗ ${errors.length} problem(s) found in ${fileName}:\n`)
    errors.forEach((error) => console.error(`  - ${error}`))
    return
  }

  console.log(`✓ ${fileName} is valid (${questions.length} questions)`)
}

if (questionFiles.length === 0) {
  console.error('✗ No question lot found in src/data')
  process.exit(1)
}

questionFiles.forEach(validateFile)
if (hasErrors) process.exit(1)
