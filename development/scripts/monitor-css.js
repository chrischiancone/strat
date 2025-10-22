#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

console.log('🔍 Starting CSS monitor...')

// Watch for CSS file changes and auto-fix if needed
const watchFiles = [
  path.join(__dirname, '..', 'app', 'globals.css'),
  path.join(__dirname, '..', 'tailwind.config.ts'),
  path.join(__dirname, '..', 'next.config.js')
]

let fixInProgress = false

function runFix() {
  if (fixInProgress) return
  
  fixInProgress = true
  console.log('⚡ Auto-fixing CSS...')
  
  exec('node scripts/fix-css.js', { cwd: path.join(__dirname, '..') }, (error) => {
    if (error) {
      console.error('❌ Auto-fix failed:', error.message)
    } else {
      console.log('✅ Auto-fix completed!')
    }
    fixInProgress = false
  })
}

// Watch for file changes
watchFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`👀 Watching ${path.basename(file)}...`)
    fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log(`📝 ${path.basename(file)} changed, checking CSS...`)
        setTimeout(runFix, 500) // Debounce
      }
    })
  }
})

// Initial fix
setTimeout(() => {
  if (!process.env.SKIP_INITIAL_FIX) {
    runFix()
  }
}, 1000)

console.log('✅ CSS monitor active. Press Ctrl+C to stop.')