'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BUDGET_CATEGORIES } from '@/lib/constants/strategic-planning'
import { useToast } from '@/hooks/use-toast'

export interface BudgetBreakdown {
  year_1: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number
  }
  year_2: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number
  }
  year_3: {
    personnel: number
    equipment: number
    services: number
    training: number
    materials: number
    other: number
    total: number
  }
  grand_total: number
}

interface BudgetBreakdownFormProps {
  initialBudget?: BudgetBreakdown
  onSave: (budget: BudgetBreakdown) => Promise<void>
  disabled?: boolean
}

const EMPTY_YEAR = {
  personnel: 0,
  equipment: 0,
  services: 0,
  training: 0,
  materials: 0,
  other: 0,
  total: 0,
}

const EMPTY_BUDGET: BudgetBreakdown = {
  year_1: { ...EMPTY_YEAR },
  year_2: { ...EMPTY_YEAR },
  year_3: { ...EMPTY_YEAR },
  grand_total: 0,
}

export function BudgetBreakdownForm({
  initialBudget,
  onSave,
  disabled = false,
}: BudgetBreakdownFormProps) {
  const [budget, setBudget] = useState<BudgetBreakdown>(
    initialBudget || EMPTY_BUDGET
  )
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Calculate totals whenever budget changes
  useEffect(() => {
    const year1Total =
      budget.year_1.personnel +
      budget.year_1.equipment +
      budget.year_1.services +
      budget.year_1.training +
      budget.year_1.materials +
      budget.year_1.other

    const year2Total =
      budget.year_2.personnel +
      budget.year_2.equipment +
      budget.year_2.services +
      budget.year_2.training +
      budget.year_2.materials +
      budget.year_2.other

    const year3Total =
      budget.year_3.personnel +
      budget.year_3.equipment +
      budget.year_3.services +
      budget.year_3.training +
      budget.year_3.materials +
      budget.year_3.other

    setBudget((prev) => ({
      ...prev,
      year_1: { ...prev.year_1, total: year1Total },
      year_2: { ...prev.year_2, total: year2Total },
      year_3: { ...prev.year_3, total: year3Total },
      grand_total: year1Total + year2Total + year3Total,
    }))
  }, [
    budget.year_1.personnel,
    budget.year_1.equipment,
    budget.year_1.services,
    budget.year_1.training,
    budget.year_1.materials,
    budget.year_1.other,
    budget.year_2.personnel,
    budget.year_2.equipment,
    budget.year_2.services,
    budget.year_2.training,
    budget.year_2.materials,
    budget.year_2.other,
    budget.year_3.personnel,
    budget.year_3.equipment,
    budget.year_3.services,
    budget.year_3.training,
    budget.year_3.materials,
    budget.year_3.other,
  ])

  const handleValueChange = (
    year: 'year_1' | 'year_2' | 'year_3',
    category: string,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0
    if (numValue < 0) return

    setBudget((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [category]: numValue,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(budget)
      toast({
        title: 'Saved',
        description: 'Budget breakdown saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save budget',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Budget Breakdown</Label>
        <p className="text-sm text-gray-500 mt-1">
          Enter budget amounts by category for each year
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left p-2 font-semibold text-sm">Category</th>
              <th className="text-right p-2 font-semibold text-sm">Year 1</th>
              <th className="text-right p-2 font-semibold text-sm">Year 2</th>
              <th className="text-right p-2 font-semibold text-sm">Year 3</th>
            </tr>
          </thead>
          <tbody>
            {BUDGET_CATEGORIES.map((category) => (
              <tr key={category.key} className="border-b border-gray-200">
                <td className="p-2 text-sm">{category.label}</td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget.year_1[category.key as keyof typeof budget.year_1]}
                    onChange={(e) =>
                      handleValueChange('year_1', category.key, e.target.value)
                    }
                    disabled={disabled || isSaving}
                    className="text-right"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget.year_2[category.key as keyof typeof budget.year_2]}
                    onChange={(e) =>
                      handleValueChange('year_2', category.key, e.target.value)
                    }
                    disabled={disabled || isSaving}
                    className="text-right"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget.year_3[category.key as keyof typeof budget.year_3]}
                    onChange={(e) =>
                      handleValueChange('year_3', category.key, e.target.value)
                    }
                    disabled={disabled || isSaving}
                    className="text-right"
                  />
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
              <td className="p-2 text-sm">Total</td>
              <td className="p-2 text-right text-sm">
                {formatCurrency(budget.year_1.total)}
              </td>
              <td className="p-2 text-right text-sm">
                {formatCurrency(budget.year_2.total)}
              </td>
              <td className="p-2 text-right text-sm">
                {formatCurrency(budget.year_3.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div>
          <p className="text-lg font-semibold">
            Grand Total: {formatCurrency(budget.grand_total)}
          </p>
          <p className="text-sm text-gray-500">Total across all years</p>
        </div>
        <Button onClick={handleSave} disabled={disabled || isSaving}>
          {isSaving ? 'Saving...' : 'Save Budget'}
        </Button>
      </div>
    </div>
  )
}
