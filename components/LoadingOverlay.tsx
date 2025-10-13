"use client"

import { useEffect, useState } from 'react'

export default function LoadingOverlay() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // If the page has already loaded before hydration, mark as loaded immediately
    if (document.readyState === 'complete') {
      setLoaded(true)
      return
    }

    const onLoad = () => setLoaded(true)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if (!loaded) return
    // Remove element after transition for parity with previous behavior
    const id = setTimeout(() => {
      const el = document.getElementById('loading-overlay')
      if (el) el.remove()
    }, 300)
    return () => clearTimeout(id)
  }, [loaded])

  return (
    <div id="loading-overlay" className={`loading-overlay${loaded ? ' loaded' : ''}`}>
      <div className="loading-spinner" />
    </div>
  )
}
