import React, { useState, useEffect } from 'react'
import MOCK_EXAM_QUESTIONS from '../data/mockExamQuestions'
import RichText from '../utils/RichText'

const LETTERS = ['A', 'B', 'C', 'D']
const TIME_LIMIT_MS = 90 * 60 * 1000
const STORAGE_KEY = 'cca-mock-exam-v1'

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── Persistence ──────────────────────────────────────────────────────────────

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearSaved() {
  localStorage.removeItem(STORAGE_KEY)
}

/** Rebuild a full exam state object from a persisted snapshot. */
function buildState(saved) {
  const questions = MOCK_EXAM_QUESTIONS
  const answers = Array.isArray(saved.answers) && saved.answers.length === questions.length
    ? saved.answers
    : new Array(questions.length).fill(null)
  const elapsed = saved.finished ? (saved.elapsedMs ?? 0) : Date.now() - saved.startTime
  const remaining = Math.max(0, TIME_LIMIT_MS - elapsed)
  const finished = Boolean(saved.finished) || remaining <= 0
  return {
    questions,
    answers,
    current: saved.current ?? 0,
    startTime: saved.startTime,
    remainingMs: remaining,
    elapsedMs: elapsed,
    finished,
  }
}

// ── Screens ────────────────────────────────────────────────────────────────

function StartScreen({ onStart, onResume, canResume }) {
  return (
    <div className="mock-start-screen">
      <h2>Mock Exam</h2>
      <p>
        Simulate the real exam with all 60 official questions, timed to match the
        actual exam conditions.
      </p>
      <div className="mock-info-grid">
        <div className="mock-info-item">
          <div className="mock-info-item-val">60</div>
          <div className="mock-info-item-label">Questions</div>
        </div>
        <div className="mock-info-item">
          <div className="mock-info-item-val">90m</div>
          <div className="mock-info-item-label">Time Limit</div>
        </div>
        <div className="mock-info-item">
          <div className="mock-info-item-val">70%</div>
          <div className="mock-info-item-label">Pass Score</div>
        </div>
      </div>
      <p className="mock-scenarios-note">
        4 scenarios · Research Pipeline, Code Exploration, Customer Support, Extraction Pipeline
      </p>
      <div className="mock-start-actions">
        {canResume && (
          <button className="mock-btn mock-btn--primary mock-btn--lg" onClick={onResume}>
            Resume Exam
          </button>
        )}
        <button
          className={`mock-btn mock-btn--lg${canResume ? '' : ' mock-btn--primary'}`}
          onClick={onStart}
        >
          {canResume ? 'Start New' : 'Start Exam'}
        </button>
      </div>
    </div>
  )
}

function QuestionScreen({ state, onSelect, onPrev, onNext, onFinish }) {
  const { questions, answers, current, remainingMs } = state
  const q = questions[current]
  const total = questions.length
  const answered = answers.filter(a => a !== null).length
  const pct = Math.round(((current + 1) / total) * 100)

  return (
    <div>
      <div className="mock-header">
        <div>
          <div className="mock-kicker">MOCK EXAM</div>
          <div className="mock-q-count">Question {current + 1} of {total}</div>
        </div>
        <div
          className={`mock-timer${remainingMs < 300000 ? ' warning' : ''}`}
          role="timer"
          aria-live="off"
          aria-label={`Time remaining: ${formatTime(remainingMs)}`}
        >
          {formatTime(remainingMs)}
        </div>
      </div>

      <div
        className="mock-progress-bar"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Question ${current + 1} of ${total}`}
      >
        <div className="mock-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="mock-question-card">
        <div className="mock-q-meta">
          <span className="mock-q-num">Q{current + 1}</span>
          <span className="mock-q-domain">{q.domainTitle}</span>
        </div>
        {q.scenario && <div className="mock-q-scenario">{q.scenario}</div>}
        <div className="mock-q-stem"><RichText text={q.stem} /></div>
        <div className="options" role="radiogroup" aria-label="Answer options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`option${answers[current] === i ? ' selected' : ''}`}
              onClick={() => onSelect(i)}
              role="radio"
              aria-checked={answers[current] === i}
            >
              <span className="opt-letter">{LETTERS[i]}</span>
              <span className="opt-text"><RichText text={opt} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="mock-nav">
        <button className="mock-btn" onClick={onPrev} disabled={current === 0}>Previous</button>
        <span className="mock-answered-count">{answered}/{total} answered</span>
        {current === total - 1
          ? <button className="mock-btn mock-btn--primary" onClick={onFinish}>Submit Exam</button>
          : <button className="mock-btn mock-btn--primary" onClick={onNext}>Next</button>
        }
      </div>
    </div>
  )
}

function ResultsScreen({ state, onReview, onRetry }) {
  const { questions, answers, elapsedMs } = state
  const usedMins = Math.floor(elapsedMs / 60000)

  const results = { total: questions.length, correct: 0, byScenario: {} }
  questions.forEach((q, i) => {
    const dId = q.domainId
    if (!results.byScenario[dId]) results.byScenario[dId] = { title: q.domainTitle, total: 0, correct: 0 }
    results.byScenario[dId].total++
    if (answers[i] === q.correct) {
      results.correct++
      results.byScenario[dId].correct++
    }
  })

  const pct = Math.round((results.correct / results.total) * 100)
  const passed = pct >= 70

  return (
    <div className="mock-results">
      <div className={`mock-score-circle ${passed ? 'pass' : 'fail'}`}>
        <div className="mock-score-pct">{pct}%</div>
        <div className="mock-score-label">{results.correct}/{results.total} correct</div>
      </div>

      <h2>{passed ? 'Passed!' : 'Not Yet'}</h2>
      <p className="mock-results-sub">Passing score: 70% · Your score: {pct}%</p>
      <p className="mock-results-time">Time used: {usedMins} minutes</p>

      <div className="mock-breakdown">
        <div className="mock-breakdown-title">Score by Scenario</div>
        {Object.keys(results.byScenario).sort().map(dId => {
          const d = results.byScenario[dId]
          const dPct = Math.round((d.correct / d.total) * 100)
          return (
            <div key={dId} className="mock-breakdown-row">
              <span className="mock-breakdown-tag">S{dId}</span>
              <span className="mock-breakdown-domain">{d.title}</span>
              <span className="mock-breakdown-score">{d.correct}/{d.total}</span>
              <div
                className="mock-breakdown-bar"
                role="progressbar"
                aria-valuenow={dPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${d.title}: ${dPct}%`}
              >
                <div
                  className="mock-breakdown-bar-fill"
                  style={{ width: `${dPct}%`, background: dPct >= 70 ? 'var(--correct)' : 'var(--danger)' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mock-results-actions">
        <button className="mock-btn" onClick={onReview}>Review Answers</button>
        <button className="mock-btn mock-btn--primary" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  )
}

function ReviewScreen({ state, onBack }) {
  return (
    <div>
      <div className="mock-review-head">
        <h2>Answer Review</h2>
        <button className="mock-btn" onClick={onBack}>← Back to Results</button>
      </div>
      {state.questions.map((q, i) => {
        const chosen = state.answers[i]
        const isCorrect = chosen === q.correct
        return (
          <div key={i} className={`mock-question-card ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
            <div className="mock-q-meta">
              <span className={`mock-q-num ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                Q{i + 1} {isCorrect ? '✓' : '✗'}
              </span>
              <span className="mock-q-domain">{q.domainTitle}</span>
            </div>
            <div className="mock-q-stem mock-q-stem--review"><RichText text={q.stem} /></div>
            <div className="mock-review-opts">
              {q.options.map((opt, oi) => {
                let cls = 'mock-review-opt'
                if (oi === q.correct) cls += ' correct'
                else if (oi === chosen && !isCorrect) cls += ' wrong'
                return (
                  <div key={oi} className={cls}>
                    <span className="mock-review-opt-letter">{LETTERS[oi]}</span>
                    <span><RichText text={opt} /></span>
                  </div>
                )
              })}
            </div>
            {q.reasoning && (
              <div className="reasoning reasoning--flush">
                <span className="reasoning-label">Explanation</span>
                <div className="reasoning-text">{q.reasoning}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function MockExam() {
  // Initialise from any persisted snapshot.
  const saved = loadSaved()
  const savedInProgress = Boolean(
    saved && saved.phase === 'exam' && !saved.finished &&
    (Date.now() - saved.startTime) < TIME_LIMIT_MS
  )

  const [phase, setPhase] = useState(() => {
    if (!saved) return 'start'
    if (saved.phase === 'review') return 'review'
    if (saved.phase === 'results' || saved.finished) return 'results'
    if ((Date.now() - saved.startTime) >= TIME_LIMIT_MS) return 'results'
    return 'start' // in-progress exam: offer resume rather than auto-jumping
  })
  const [examState, setExamState] = useState(() => (saved ? buildState(saved) : null))
  const [canResume, setCanResume] = useState(savedInProgress)

  // Run the countdown whenever an unfinished exam is active.
  useEffect(() => {
    if (phase !== 'exam' || !examState || examState.finished) return
    const id = setInterval(() => {
      setExamState(prev => {
        if (!prev || prev.finished) return prev
        const elapsed = Date.now() - prev.startTime
        const remaining = Math.max(0, TIME_LIMIT_MS - elapsed)
        if (remaining <= 0) {
          return { ...prev, remainingMs: 0, elapsedMs: elapsed, finished: true }
        }
        return { ...prev, remainingMs: remaining, elapsedMs: elapsed }
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, examState?.finished])

  // Auto-submit when time runs out.
  useEffect(() => {
    if (examState?.finished && phase === 'exam') setPhase('results')
  }, [examState?.finished, phase])

  // Persist snapshot on any meaningful change.
  useEffect(() => {
    if (!examState || phase === 'start') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      phase,
      answers: examState.answers,
      current: examState.current,
      startTime: examState.startTime,
      elapsedMs: examState.elapsedMs,
      finished: examState.finished,
    }))
  }, [phase, examState])

  function startExam() {
    clearSaved()
    setCanResume(false)
    const questions = MOCK_EXAM_QUESTIONS
    setExamState({
      questions,
      answers: new Array(questions.length).fill(null),
      current: 0,
      startTime: Date.now(),
      remainingMs: TIME_LIMIT_MS,
      elapsedMs: 0,
      finished: false,
    })
    setPhase('exam')
  }

  function resumeExam() {
    setCanResume(false)
    setPhase('exam')
  }

  function selectAnswer(idx) {
    setExamState(prev => {
      const answers = [...prev.answers]
      answers[prev.current] = idx
      return { ...prev, answers }
    })
  }

  function goNext() {
    setExamState(prev => ({ ...prev, current: Math.min(prev.current + 1, prev.questions.length - 1) }))
  }

  function goPrev() {
    setExamState(prev => ({ ...prev, current: Math.max(prev.current - 1, 0) }))
  }

  function finishExam() {
    const unanswered = examState.answers.filter(a => a === null).length
    if (unanswered > 0) {
      const ok = window.confirm(
        `You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. ` +
        `Unanswered questions are marked incorrect. Submit anyway?`
      )
      if (!ok) return
    }
    setExamState(prev => ({ ...prev, finished: true, elapsedMs: Date.now() - prev.startTime }))
    setPhase('results')
  }

  function retry() {
    clearSaved()
    setCanResume(false)
    setExamState(null)
    setPhase('start')
  }

  if (phase === 'start') {
    return <StartScreen onStart={startExam} onResume={resumeExam} canResume={canResume} />
  }
  if (phase === 'exam' && examState) {
    return (
      <QuestionScreen
        state={examState}
        onSelect={selectAnswer}
        onPrev={goPrev}
        onNext={goNext}
        onFinish={finishExam}
      />
    )
  }
  if (phase === 'results' && examState) {
    return (
      <ResultsScreen
        state={examState}
        onReview={() => setPhase('review')}
        onRetry={retry}
      />
    )
  }
  if (phase === 'review' && examState) {
    return <ReviewScreen state={examState} onBack={() => setPhase('results')} />
  }
  return <StartScreen onStart={startExam} onResume={resumeExam} canResume={canResume} />
}
