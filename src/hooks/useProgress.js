import { useState, useEffect, useMemo, useCallback } from 'react'
import { makeQuestionKey, countQuestions, scoreDomain } from '../lib/scoring'

const STORAGE_KEY = 'cca-exam-progress-v3'

// Re-exported so components can keep importing it from the hook module.
export { makeQuestionKey }

export function useProgress(domains) {
  const [answers, setAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const totalQuestions = useMemo(() => countQuestions(domains), [domains])

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

  const answerQuestion = useCallback((key, idx) => {
    setAnswers(prev => ({ ...prev, [key]: idx }))
  }, [])

  const getAnswer = useCallback((key) => answers[key] ?? null, [answers])

  const getDomainScore = useCallback(
    (domainId) => scoreDomain(domains, domainId, answers),
    [domains, answers]
  )

  const resetProgress = useCallback(() => {
    setAnswers({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    answers,
    totalQuestions,
    answeredCount,
    answerQuestion,
    getAnswer,
    getDomainScore,
    resetProgress,
  }
}
