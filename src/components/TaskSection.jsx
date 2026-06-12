import React, { useState } from 'react'
import SkillItem from './SkillItem'

export default function TaskSection({ task, domainId, getAnswer, answerQuestion }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`task-section${collapsed ? ' collapsed' : ''}`}>
      <button
        type="button"
        className="task-header"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        <span className="task-num">{task.id}</span>
        <span className="task-title">{task.title}</span>
        <span className="task-chevron" aria-hidden="true">▾</span>
      </button>

      {!collapsed && (
        <div className="task-body">
          {task.skills.map((skill, si) => (
            <SkillItem
              key={si}
              skill={skill}
              domainId={domainId}
              taskId={task.id}
              getAnswer={getAnswer}
              answerQuestion={answerQuestion}
            />
          ))}
        </div>
      )}
    </div>
  )
}
