'use client'

import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { Toaster } from '@/components/ui/toaster'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  userProfile?: {
    full_name: string
    email: string
    role: string
    department_id: string | null
  }
}

export function DashboardLayoutClient({ children, userProfile }: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <Header 
        user={userProfile} 
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          userRole={userProfile?.role} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
          <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <Breadcrumbs />
          </div>
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}