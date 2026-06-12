import { describe, it, expect } from 'vitest'
import { hashString, makeQuestionKey, countQuestions, scoreDomain } from './scoring'

// Minimal fixture mirroring the shape of domains.js (one question per skill).
const DOMAINS = [
  {
    id: 1,
    tasks: [
      {
        id: '1.1',
        skills: [
          { text: 'skill A', q: { correct: 1 } },
          { text: 'skill B', q: { correct: 0 } },
        ],
      },
      {
        id: '1.2',
        skills: [{ text: 'skill C', q: { correct: 2 } }],
      },
    ],
  },
  {
    id: 2,
    tasks: [
      { id: '2.1', skills: [{ text: 'skill D', q: { correct: 3 } }] },
    ],
  },
]

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('hello')).toBe(hashString('hello'))
  })
  it('differs for different input', () => {
    expect(hashString('hello')).not.toBe(hashString('world'))
  })
})

describe('makeQuestionKey', () => {
  it('produces the documented format', () => {
    const key = makeQuestionKey(1, '1.1', 'skill A')
    expect(key).toMatch(/^d1-1\.1-q[0-9a-z]+$/)
  })

  it('is content-stable: same text yields same key regardless of position', () => {
    // Simulate reordering by computing the key from the same text twice.
    expect(makeQuestionKey(1, '1.1', 'skill A')).toBe(makeQuestionKey(1, '1.1', 'skill A'))
  })

  it('changes when the question text changes', () => {
    expect(makeQuestionKey(1, '1.1', 'skill A')).not.toBe(makeQuestionKey(1, '1.1', 'skill A!'))
  })
})

describe('countQuestions', () => {
  it('counts one question per skill across all domains', () => {
    expect(countQuestions(DOMAINS)).toBe(4)
  })
})

describe('scoreDomain', () => {
  it('returns zeroes for an unknown domain', () => {
    expect(scoreDomain(DOMAINS, 99, {})).toEqual({ total: 0, correct: 0, answered: 0 })
  })

  it('reports total with no answers', () => {
    expect(scoreDomain(DOMAINS, 1, {})).toEqual({ total: 3, correct: 0, answered: 0 })
  })

  it('counts correct and incorrect answers', () => {
    const answers = {
      [makeQuestionKey(1, '1.1', 'skill A')]: 1, // correct
      [makeQuestionKey(1, '1.1', 'skill B')]: 2, // wrong (correct is 0)
      [makeQuestionKey(1, '1.2', 'skill C')]: 2, // correct
    }
    expect(scoreDomain(DOMAINS, 1, answers)).toEqual({ total: 3, correct: 2, answered: 3 })
  })

  it('treats a selected index of 0 as an answer (not "unanswered")', () => {
    const answers = { [makeQuestionKey(1, '1.1', 'skill B')]: 0 } // correct is 0
    expect(scoreDomain(DOMAINS, 1, answers)).toEqual({ total: 3, correct: 1, answered: 1 })
  })

  it('scores a different domain independently', () => {
    const answers = { [makeQuestionKey(2, '2.1', 'skill D')]: 3 }
    expect(scoreDomain(DOMAINS, 2, answers)).toEqual({ total: 1, correct: 1, answered: 1 })
  })
})
