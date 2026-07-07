/**
 * ErrorBoundary — React class component that catches render errors in its
 * subtree and displays a friendly recovery UI instead of a blank screen.
 *
 * Usage:
 *   <ErrorBoundary key={someProp}>
 *     <ComponentThatMightCrash />
 *   </ErrorBoundary>
 *
 * Note: key={someProp} on ErrorBoundary causes it to remount (and reset)
 * when the key changes — useful for resetting between page navigations.
 */
import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production you'd send this to an error reporting service
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack)
  }

  handleReset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-64 gap-5 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-400/30 flex items-center justify-center text-red-400">
            <AlertTriangle size={28} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-red-400 font-semibold text-lg mb-1">
              Something went wrong
            </h3>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-slate-800 border border-slate-600
              text-slate-300 hover:bg-slate-700
              transition-colors duration-200
            "
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
