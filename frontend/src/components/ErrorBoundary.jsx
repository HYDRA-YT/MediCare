import { Component } from 'react'
import { Button } from './ui'

/**
 * Catches runtime errors inside any page so one broken screen can never
 * blank the entire app. Shows a recoverable error card instead.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/10">
            <svg className="h-7 w-7 text-rose-600 dark:text-rose-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0 1 1 0 01-2 0zm.25-7.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            This page hit a snag
          </h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
            <Button onClick={() => { window.location.href = '/' }}>
              Go Home
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
