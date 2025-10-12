import { DollarSign, Target, Building2, CheckCircle, Clock } from 'lucide-react'
import type { FinanceBudgetSummary } from '@/app/actions/finance-budgets'

interface BudgetSummaryCardsProps {
  summary: FinanceBudgetSummary
}

export function BudgetSummaryCards({ summary }: BudgetSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const validationPercentage =
    summary.total_initiatives > 0
      ? Math.round((summary.budgets_validated / summary.total_initiatives) * 100)
      : 0

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {/* Total Budget */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Budget</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(summary.total_budget)}
            </p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Initiatives */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Initiatives</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total_initiatives}</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <Target className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Departments */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Departments</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total_departments}</p>
          </div>
          <div className="rounded-full bg-purple-100 p-3">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Budgets Validated */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Validated</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{summary.budgets_validated}</p>
            <p className="mt-1 text-xs text-gray-500">{validationPercentage}% complete</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Pending Validation */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {summary.budgets_pending_validation}
            </p>
            <p className="mt-1 text-xs text-gray-500">Need review</p>
          </div>
          <div className="rounded-full bg-amber-100 p-3">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
