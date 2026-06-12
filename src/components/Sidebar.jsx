import React from 'react'

export default function Sidebar({
  domains,
  activeView,
  onSelectView,
  answeredCount,
  totalQuestions,
  onClose,
  className = '',
}) {
  const pct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  function handleNav(view) {
    onSelectView(view)
    onClose()
  }

  return (
    <nav className={`sidebar${className ? ` ${className}` : ''}`} aria-label="Primary">
      <div className="sidebar-brand">
        <div className="title">Claude Certified Architect<br />Foundations Prep</div>
      </div>

      <div className="nav-section-label">Domains</div>

      <button
        className={`domain-btn${activeView === 'home' ? ' active' : ''}`}
        onClick={() => handleNav('home')}
        aria-current={activeView === 'home' ? 'page' : undefined}
      >
        <span className="d-num">⌂</span>
        <span className="d-label">Overview</span>
      </button>

      {domains.map(d => (
        <button
          key={d.id}
          className={`domain-btn${activeView === `domain-${d.id}` ? ' active' : ''}`}
          onClick={() => handleNav(`domain-${d.id}`)}
          aria-current={activeView === `domain-${d.id}` ? 'page' : undefined}
          title={d.title}
        >
          <span className="d-num">D{d.id}</span>
          <span className="d-label">{d.title}</span>
          <span className="d-pct">{d.weight}</span>
        </button>
      ))}

      <div className="nav-section-label nav-section-label--spaced">Tools</div>

      <button
        className={`domain-btn${activeView === 'mock' ? ' active' : ''}`}
        onClick={() => handleNav('mock')}
        aria-current={activeView === 'mock' ? 'page' : undefined}
      >
        <span className="d-num">⏱</span>
        <span className="d-label">Mock Exam</span>
      </button>

      <button
        className={`domain-btn${activeView === 'cheatsheet' ? ' active' : ''}`}
        onClick={() => handleNav('cheatsheet')}
        aria-current={activeView === 'cheatsheet' ? 'page' : undefined}
      >
        <span className="d-num">≡</span>
        <span className="d-label">Cheat Sheet</span>
      </button>

      <div className="sidebar-progress">
        <div className="prog-label">Overall Progress</div>
        <div
          className="prog-bar-bg"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall progress"
        >
          <div className="prog-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="prog-count">
          {answeredCount} / {totalQuestions} answered
        </div>
      </div>
    </nav>
  )
}
