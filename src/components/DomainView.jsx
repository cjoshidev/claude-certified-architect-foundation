import React from 'react'
import TaskSection from './TaskSection'

export default function DomainView({ domain, getDomainScore, getAnswer, answerQuestion }) {
  const score = getDomainScore(domain.id)
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
  const barColor = pct >= 70 ? 'var(--correct)' : pct > 0 ? 'var(--warning)' : 'var(--border)'

  return (
    <div>
      <div className="domain-header">
        <div className="domain-meta">
          <span className="domain-tag">D{domain.id}</span>
          <span className="domain-weight">{domain.weight} of exam</span>
        </div>
        <h1 className="domain-title">{domain.title}</h1>
        <p className="domain-desc">{domain.desc}</p>

        {score.answered > 0 && (
          <div className="domain-score-bar">
            <div
              className="prog-bar-bg prog-bar-bg--flex"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Domain score: ${pct}% correct`}
            >
              <div
                className="prog-bar-fill"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
            <span className="domain-score-text">
              {score.correct}/{score.answered} correct ({pct}%)
            </span>
          </div>
        )}
      </div>

      {domain.tasks.map((task) => (
        <TaskSection
          key={task.id}
          task={task}
          domainId={domain.id}
          getAnswer={getAnswer}
          answerQuestion={answerQuestion}
        />
      ))}
    </div>
  )
}
