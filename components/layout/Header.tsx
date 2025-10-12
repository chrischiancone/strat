'use client'

import { useState } from 'react'
import { signOut } from '@/app/actions/auth'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'

interface HeaderProps {
  user?: {
    full_name?: string
    email?: string
  }
}

export function Header({ user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-sm">
            <span className="text-lg font-bold text-white">SP</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Strategic Planning</h1>
            <p className="text-xs text-gray-500">Municipal Management System</p>
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div className="flex items-center gap-4">
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg z-20 animate-in">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                  <div className="p-2">
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => {
                        setShowUserMenu(false)
                        // Navigate to profile page when implemented
                      }}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => {
                        setShowUserMenu(false)
                        // Navigate to settings page when implemented
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
