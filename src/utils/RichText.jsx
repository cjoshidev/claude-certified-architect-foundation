import React from 'react'

/**
 * Renders plain text with markdown-style `inline code` spans converted to
 * <code> elements. This replaces dangerouslySetInnerHTML across the app:
 * content is treated as text (never parsed as HTML), so it is safe even if
 * question data later includes characters like < or &.
 *
 * Usage: <RichText text="Terminate on `end_turn`." />
 */
export default function RichText({ text, className }) {
  if (text == null) return null
  // Split on backtick-delimited spans; odd-indexed parts are code.
  const parts = String(text).split('`')
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <code key={i}>{part}</code>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </span>
  )
}
