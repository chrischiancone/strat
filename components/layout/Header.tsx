'use client'

import { signOut } from '@/app/actions/auth'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Strat Plan</h1>
          <span className="text-sm text-gray-500">Strategic Planning System</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-700 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
