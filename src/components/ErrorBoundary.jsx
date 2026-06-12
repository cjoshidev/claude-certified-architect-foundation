import React from 'react'

/**
 * Catches render-time errors (e.g. a malformed question object) so a single
 * bad record degrades to a recoverable message instead of white-screening
 * the whole app.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface the detail in the console for debugging.
    console.error('Unhandled error in UI:', error, info)
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary" role="alert">
          <h2>Something went wrong</h2>
          <p>
            This view hit an unexpected error and couldn’t be displayed. Your
            saved progress is safe.
          </p>
          <pre className="error-boundary-detail">{String(this.state.error)}</pre>
          <button className="mock-btn mock-btn--primary" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
