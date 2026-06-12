import React from 'react'
import RichText from '../utils/RichText'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * Renders a single practice question with selectable options. Each skill
 * carries exactly one question, so there is no tab UI.
 */
export default function QuestionPanel({ q, questionKey, getAnswer, answerQuestion }) {
  const answer = getAnswer(questionKey)
  const locked = answer !== null

  function handleSelect(idx) {
    if (locked) return
    answerQuestion(questionKey, idx)
  }

  return (
    <div className="question-panel">
      <span className="q-label">Practice Question</span>

      {q.scenario && <div className="q-scenario">{q.scenario}</div>}
      <div className="q-stem"><RichText text={q.stem} /></div>

      <div className="options" role="radiogroup" aria-label="Answer options">
        {q.options.map((opt, i) => {
          let cls = 'option'
          if (locked) {
            cls += ' locked'
            if (i === q.correct) cls += ' correct'
            else if (i === answer) cls += ' wrong'
          } else if (i === answer) {
            cls += ' selected'
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => handleSelect(i)}
              disabled={locked}
              role="radio"
              aria-checked={i === answer}
            >
              <span className="opt-letter">{LETTERS[i]}</span>
              <span className="opt-text"><RichText text={opt} /></span>
            </button>
          )
        })}
      </div>

      {locked && (
        <div>
          <div className={`result-badge ${answer === q.correct ? 'correct-badge' : 'wrong-badge'}`}>
            {answer === q.correct ? '✓ Correct' : '✗ Incorrect'}
          </div>
          <div className="reasoning">
            <span className="reasoning-label">Explanation</span>
            <div className="reasoning-text">{q.reasoning}</div>
          </div>
        </div>
      )}
    </div>
  )
}
