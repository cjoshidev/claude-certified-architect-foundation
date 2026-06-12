import React from 'react'

function barColorFor(pct) {
  if (pct === null) return 'var(--border)'
  if (pct >= 70) return 'var(--correct)'
  return 'var(--warning)'
}

export default function Home({ domains, getDomainScore, onSelectDomain, onResetProgress }) {
  const overallScore = domains.reduce(
    (acc, d) => {
      const s = getDomainScore(d.id)
      acc.correct += s.correct
      acc.total += s.total
      acc.answered += s.answered
      return acc
    },
    { correct: 0, total: 0, answered: 0 }
  )
  const overallPct = overallScore.answered > 0
    ? Math.round((overallScore.correct / overallScore.answered) * 100)
    : null

  return (
    <div className="home-screen">
      <h1>Exam Prep</h1>
      <p className="subtitle">
        Five domains, {overallScore.total} practice questions drawn directly from the official exam guide skills.
        Select a domain to begin.
      </p>

      <div className="domain-cards">
        {domains.map(d => {
          const score = getDomainScore(d.id)
          const pct = score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : null

          return (
            <button
              key={d.id}
              type="button"
              className="domain-card"
              onClick={() => onSelectDomain(d.id)}
            >
              <span className="dc-num">0{d.id}</span>
              <span className="dc-info">
                <span className="dc-title">{d.title}</span>
                <span className="dc-meta">
                  {d.tasks.length} task statements · {d.weight} of exam
                  {score.answered > 0 && ` · ${score.answered}/${score.total} answered`}
                </span>
              </span>
              <span className="dc-score">
                <span className="dc-score-pct">{d.weight}</span>
                {score.answered > 0 && (
                  <span
                    className="dc-score-bar"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${d.title}: ${pct}% correct`}
                  >
                    <span
                      className="dc-score-bar-fill"
                      style={{ width: `${pct}%`, background: barColorFor(pct) }}
                    />
                  </span>
                )}
              </span>
              <span className="dc-arrow" aria-hidden="true">→</span>
            </button>
          )
        })}
      </div>

      {overallScore.answered > 0 && (
        <div className="score-summary">
          <div className="score-summary-title">Score Summary</div>
          {domains.map(d => {
            const s = getDomainScore(d.id)
            const p = s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0
            const barColor = s.answered > 0 ? barColorFor(p) : 'var(--border)'
            return (
              <div key={d.id} className="score-summary-row">
                <span className="score-summary-domain-tag">D{d.id}</span>
                <span className="score-summary-label">{d.title}</span>
                <span className="score-summary-count">
                  {s.answered > 0 ? `${s.correct}/${s.answered}` : '—'}
                </span>
                <div
                  className="score-summary-bar"
                  role="progressbar"
                  aria-valuenow={p}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${d.title}: ${p}% correct`}
                >
                  <div
                    className="score-summary-bar-fill"
                    style={{ width: `${p}%`, background: barColor }}
                  />
                </div>
              </div>
            )
          })}
          {overallPct !== null && (
            <div className="score-summary-overall">
              Overall: {overallScore.correct}/{overallScore.answered} correct ({overallPct}%)
              {overallPct >= 70 ? ' · On track for exam!' : ' · Keep practising'}
            </div>
          )}
          <button
            className="reset-btn"
            onClick={() => {
              if (window.confirm('Reset all progress? This cannot be undone.')) onResetProgress()
            }}
          >
            Reset progress
          </button>
        </div>
      )}
    </div>
  )
}
