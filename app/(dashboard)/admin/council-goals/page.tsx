'use client'

import { useEffect, useState } from 'react'
import { CouncilGoalsManager } from '@/components/admin/CouncilGoalsManager'
import { getCouncilGoals, type CouncilGoal } from '@/app/actions/council-goals'

export default function CouncilGoalsPage() {
  const [goals, setGoals] = useState<CouncilGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadGoals() {
      try {
        setIsLoading(true)
        setError(null)
        const fetchedGoals = await getCouncilGoals()
        setGoals(fetchedGoals)
      } catch (error) {
        console.error('Error loading council goals:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadGoals()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Council Goals</h1>
          <p className="mt-2 text-gray-600">
            Manage the city&apos;s core values and strategic focus areas that departments align their plans with.
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Council Goals</h1>
          <p className="mt-2 text-gray-600">
            Manage the city&apos;s core values and strategic focus areas that departments align their plans with.
          </p>
        </div>

        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Council Goals
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {error}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Council Goals</h1>
        <p className="mt-2 text-gray-600">
          Manage the city&apos;s core values and strategic focus areas that departments align their plans with.
        </p>
      </div>

      <CouncilGoalsManager initialGoals={goals} />
    </div>
  )
}
