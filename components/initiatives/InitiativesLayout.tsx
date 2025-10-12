'use client'

import { ReactNode } from 'react'
import { InitiativesFooter } from './InitiativesFooter'

interface InitiativesLayoutProps {
  children: ReactNode
}

export function InitiativesLayout({ children }: InitiativesLayoutProps) {
  return (
    <div className="grid h-[calc(100vh-64px)] grid-rows-[auto,1fr,auto]">
      {children}
      <InitiativesFooter />
    </div>
  )
}