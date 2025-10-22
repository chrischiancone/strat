#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Fixing CSS issues...')

// Clear Next.js cache
const nextCacheDir = path.join(__dirname, '..', '.next')
if (fs.existsSync(nextCacheDir)) {
  console.log('🗑️  Clearing .next cache...')
  fs.rmSync(nextCacheDir, { recursive: true, force: true })
}

// Clear node_modules/.cache
const nodeCacheDir = path.join(__dirname, '..', 'node_modules', '.cache')
if (fs.existsSync(nodeCacheDir)) {
  console.log('🗑️  Clearing node_modules cache...')
  fs.rmSync(nodeCacheDir, { recursive: true, force: true })
}

// Touch CSS files to force rebuild
const cssFiles = [
  path.join(__dirname, '..', 'app', 'globals.css'),
  path.join(__dirname, '..', 'tailwind.config.ts')
]

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`👉 Touching ${path.basename(file)}...`)
    const now = new Date()
    fs.utimesSync(file, now, now)
  }
})

console.log('✅ CSS fix completed!')
console.log('💡 Run: npm run dev')