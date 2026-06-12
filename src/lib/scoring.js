// Pure, framework-free scoring + key logic. Kept separate from the React hook
// so it can be unit-tested directly (see scoring.test.js).

/**
 * Small, stable string hash (djb2). Used to derive content-based question
 * keys so that inserting or reordering questions in domains.js never
 * corrupts previously saved progress for unrelated questions.
 */
export function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Stable question key derived from domain id, the (stable) task id, and the
 * question's own text — unaffected by reordering or insertion.
 * Key format: "d{domainId}-{taskId}-q{hash}"
 */
export function makeQuestionKey(domainId, taskId, questionText) {
  return `d${domainId}-${taskId}-q${hashString(questionText)}`
}

/** Total number of questions across all domains (one question per skill). */
export function countQuestions(domains) {
  let n = 0
  domains.forEach(d =>
    d.tasks.forEach(t =>
      t.skills.forEach(s => {
        if (s.q) n += 1
      })
    )
  )
  return n
}

/**
 * Per-domain score given the answers map.
 * @returns {{ total: number, correct: number, answered: number }}
 */
export function scoreDomain(domains, domainId, answers) {
  const domain = domains.find(d => d.id === domainId)
  if (!domain) return { total: 0, correct: 0, answered: 0 }
  let total = 0, correct = 0, answered = 0
  domain.tasks.forEach(t =>
    t.skills.forEach(s => {
      if (!s.q) return
      const key = makeQuestionKey(domainId, t.id, s.text)
      total++
      if (key in answers) {
        answered++
        if (answers[key] === s.q.correct) correct++
      }
    })
  )
  return { total, correct, answered }
}
