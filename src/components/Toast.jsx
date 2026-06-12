import React, { useEffect, useState, useCallback } from 'react'

let _showToast = null

export function showToast(msg) {
  if (_showToast) _showToast(msg)
}

export default function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = React.useRef(null)

  const show = useCallback((msg) => {
    setMessage(msg)
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 3000)
  }, [])

  useEffect(() => {
    _showToast = show
    return () => { _showToast = null }
  }, [show])

  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      {message}
    </div>
  )
}
