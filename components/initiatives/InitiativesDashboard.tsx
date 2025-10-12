import { ReactNode } from 'react'
import { InitiativesFooter } from './InitiativesFooter'

interface InitiativesDashboardProps {
  children: ReactNode
}

export function InitiativesDashboard({ children }: InitiativesDashboardProps) {
  return (
    <div className="grid h-[calc(100vh-64px)] grid-rows-[auto,1fr,auto]">
      {children}
      <InitiativesFooter />
    </div>
  )
}