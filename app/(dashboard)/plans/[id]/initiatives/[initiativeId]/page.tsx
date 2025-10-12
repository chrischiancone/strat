import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge, PriorityBadge, FundingStatusBadge as _FundingStatusBadge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { getInitiativeDetail, InitiativeDetailData } from '@/app/actions/initiative-detail'
import { createServerSupabaseClient } from '@/lib/supabase/server'
// import { CommentsSection } from '@/components/comments/CommentsSection'

interface PageProps {
  params: Promise<{
    id: string
    initiativeId: string
  }>
}

// Component for budget category breakdown
interface BudgetCategoryBreakdownProps {
  budgets: Array<{
    personnel_cost: number
    equipment_cost: number
    services_cost: number
    training_cost: number
    materials_cost: number
    other_cost: number
  }>
  formatCurrency: (amount: number) => string
}

function _BudgetCategoryBreakdown({ budgets, formatCurrency }: BudgetCategoryBreakdownProps) {
  // Calculate total costs by category across all years
  const categoryTotals = budgets.reduce((acc, budget) => {
    return {
      personnel: acc.personnel + budget.personnel_cost,
      equipment: acc.equipment + budget.equipment_cost,
      services: acc.services + budget.services_cost,
      training: acc.training + budget.training_cost,
      materials: acc.materials + budget.materials_cost,
      other: acc.other + budget.other_cost,
    }
  }, { personnel: 0, equipment: 0, services: 0, training: 0, materials: 0, other: 0 })

  const totalBudget = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  const categories = [
    { name: 'Personnel', amount: categoryTotals.personnel, color: 'bg-blue-500', lightColor: 'bg-blue-100', textColor: 'text-blue-700' },
    { name: 'Equipment', amount: categoryTotals.equipment, color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-700' },
    { name: 'Services', amount: categoryTotals.services, color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-700' },
    { name: 'Training', amount: categoryTotals.training, color: 'bg-amber-500', lightColor: 'bg-amber-100', textColor: 'text-amber-700' },
    { name: 'Materials', amount: categoryTotals.materials, color: 'bg-pink-500', lightColor: 'bg-pink-100', textColor: 'text-pink-700' },
    { name: 'Other', amount: categoryTotals.other, color: 'bg-gray-500', lightColor: 'bg-gray-100', textColor: 'text-gray-700' },
  ].filter(cat => cat.amount > 0)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Budget by Category</h2>
        <span className="text-sm text-gray-600">{formatCurrency(totalBudget)} Total</span>
      </div>

      {/* Visual Bar */}
      <div className="mb-6 h-8 flex rounded-lg overflow-hidden">
        {categories.map((category, idx) => {
          const percentage = (category.amount / totalBudget) * 100
          return percentage > 0 ? (
            <div
              key={idx}
              className={`${category.color} flex items-center justify-center text-white text-xs font-medium`}
              style={{ width: `${percentage}%` }}
              title={`${category.name}: ${percentage.toFixed(1)}%`}
            >
              {percentage > 10 && `${percentage.toFixed(0)}%`}
            </div>
          ) : null
        })}
      </div>

      {/* Category Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, idx) => {
          const percentage = ((category.amount / totalBudget) * 100).toFixed(1)
          return (
            <div key={idx} className={`rounded-lg ${category.lightColor} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${category.textColor}`}>
                  {category.name}
                </span>
                <span className={`text-xs font-semibold ${category.textColor}`}>
                  {percentage}%
                </span>
              </div>
              <p className={`text-lg font-bold ${category.textColor}`}>
                {formatCurrency(category.amount)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default async function InitiativeDetailPage({ params }: PageProps) {
  const { id: planId, initiativeId } = await params

  let userRole: string | null = null
  // let userId: string | null = null // Temporarily unused

  let initiative!: InitiativeDetailData
  try {
    initiative = await getInitiativeDetail(initiativeId)

    // Get user info
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // userId = user.id
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single<{ role: string }>()

      userRole = profile?.role || null
    }
  } catch (error) {
    console.error('Error loading initiative:', error)
    notFound()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const backLink = userRole === 'finance' ? '/finance' : `/plans/${planId}`

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href={backLink}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{initiative.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <PriorityBadge priority={initiative.priority_level as 'NEED' | 'WANT' | 'NICE_TO_HAVE'} />
              <StatusBadge status={initiative.status} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Initiative Details</h2>
              <p className="text-sm text-gray-600">{initiative.description || 'No description provided'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Summary</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(initiative.total_cost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Year 1</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {formatCurrency(initiative.year_1_cost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Year 2</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {formatCurrency(initiative.year_2_cost)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
