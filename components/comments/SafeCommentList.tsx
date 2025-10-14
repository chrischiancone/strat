'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class SafeCommentList extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('DOM manipulation error in comments:', error, errorInfo)
    
    // If it's a DOM manipulation error, try to recover by reloading after a delay
    if (error.message.includes('removeChild') || error.message.includes('Node')) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="text-sm text-red-800">
            <strong>Comments temporarily unavailable</strong>
            <p className="mt-1">The page will refresh automatically in a moment...</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}