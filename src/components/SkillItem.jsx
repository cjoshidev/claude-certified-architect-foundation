import React, { useState } from 'react'
import { makeQuestionKey } from '../hooks/useProgress'
import QuestionPanel from './QuestionPanel'

export default function SkillItem({ skill, domainId, taskId, getAnswer, answerQuestion }) {
  const [open, setOpen] = useState(false)
  const questionKey = makeQuestionKey(domainId, taskId, skill.text)
  const answered = skill.q ? getAnswer(questionKey) !== null : false

  return (
    <div className={`skill-item${answered ? ' answered' : ''}${open ? ' open' : ''}`}>
      <button
        type="button"
        className="skill-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="skill-dot" />
        <span className="skill-text">{skill.text}</span>
        <span className="skill-toggle">{open ? 'hide ▲' : 'quiz ▼'}</span>
      </button>

      {open && skill.q && (
        <QuestionPanel
          q={skill.q}
          questionKey={questionKey}
          getAnswer={getAnswer}
          answerQuestion={answerQuestion}
        />
      )}
    </div>
  )
}
