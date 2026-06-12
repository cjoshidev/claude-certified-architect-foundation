import React, { useState, useEffect, useRef } from 'react'
import DOMAINS from './data/domains'
import { useProgress } from './hooks/useProgress'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import DomainView from './components/DomainView'
import MockExam from './components/MockExam'
import CheatSheet from './components/CheatSheet'
import ErrorBoundary from './components/ErrorBoundary'

/** Map the current location hash to a known view, falling back to home. */
function viewFromHash() {
  const h = (window.location.hash || '').replace(/^#/, '')
  if (!h || h === 'home') return 'home'
  if (h === 'mock' || h === 'cheatsheet') return h
  if (h.startsWith('domain-')) {
    const id = parseInt(h.split('-')[1], 10)
    if (DOMAINS.some(d => d.id === id)) return `domain-${id}`
  }
  return 'home'
}

export default function App() {
  const [view, setViewState] = useState(viewFromHash)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mainRef = useRef(null)

  const {
    answeredCount,
    totalQuestions,
    answerQuestion,
    getAnswer,
    getDomainScore,
    resetProgress,
  } = useProgress(DOMAINS)

  // Keep view state in sync with the URL hash (supports refresh + back/forward).
  useEffect(() => {
    function onHashChange() {
      setViewState(viewFromHash())
      setSidebarOpen(false)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function setView(next) {
    if ((window.location.hash || '').replace(/^#/, '') !== next) {
      window.location.hash = next // triggers hashchange -> setViewState
    } else {
      setViewState(next)
    }
  }

  // Close sidebar on larger viewports
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // On view change: scroll to top and move focus to the content region.
  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (mainRef.current) mainRef.current.focus()
  }, [view])

  function renderContent() {
    if (view === 'home') {
      return (
        <Home
          domains={DOMAINS}
          getDomainScore={getDomainScore}
          onSelectDomain={(id) => setView(`domain-${id}`)}
          onResetProgress={resetProgress}
        />
      )
    }

    if (view.startsWith('domain-')) {
      const id = parseInt(view.split('-')[1], 10)
      const domain = DOMAINS.find(d => d.id === id)
      if (!domain) return null
      return (
        <DomainView
          domain={domain}
          getDomainScore={getDomainScore}
          getAnswer={getAnswer}
          answerQuestion={answerQuestion}
        />
      )
    }

    if (view === 'mock') {
      return <MockExam />
    }

    if (view === 'cheatsheet') {
      return <CheatSheet />
    }

    return null
  }

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>
        <span className="mobile-header-title">Claude Certified Architect Prep</span>
      </div>

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="shell">
        <Sidebar
          domains={DOMAINS}
          activeView={view}
          onSelectView={setView}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          onClose={() => setSidebarOpen(false)}
          className={sidebarOpen ? 'open' : ''}
        />

        <main className="main" ref={mainRef} tabIndex={-1}>
          <ErrorBoundary key={view}>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
    </>
  )
}
