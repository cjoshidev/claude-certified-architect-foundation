import React from 'react'
import CHEAT_SHEET from '../data/cheatSheet'
import RichText from '../utils/RichText'

export default function CheatSheet() {
  return (
    <div className="cheat-sheet">
      <div className="cheat-head">
        <h1>Quick Reference</h1>
        <button className="cheat-print-btn" onClick={() => window.print()}>Print / Save PDF</button>
      </div>
      <div className="cheat-subtitle">Essential facts, decision rules, and patterns for the Claude Certified Architect exam</div>

      {Object.values(CHEAT_SHEET).map(domain => (
        <div key={domain.tag} className="cheat-domain">
          <div className="cheat-domain-title">
            <span className="cheat-domain-tag">{domain.tag}</span>
            {domain.title}
          </div>
          {domain.rules.map((rule, i) => (
            <div key={i} className="cheat-rule">
              <span className="cheat-rule-icon">●</span>
              <span className="cheat-rule-text">
                <strong>{rule.label}:</strong>{' '}
                <RichText text={rule.text} />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
