'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export interface RoiAnalysis {
  financial: {
    annual_savings: number
    annual_revenue: number
    payback_months: number
    three_year_impact: number
  }
  non_financial: {
    service_quality: string
    efficiency_gains: string
    risk_reduction: string
    citizen_satisfaction: string
    employee_impact: string
  }
}

interface RoiAnalysisFormProps {
  initialRoi?: RoiAnalysis
  onSave: (roi: RoiAnalysis) => Promise<void>
  disabled?: boolean
}

export function RoiAnalysisForm({
  initialRoi,
  onSave,
  disabled = false,
}: RoiAnalysisFormProps) {
  const [roi, setRoi] = useState<RoiAnalysis>(
    initialRoi || {
      financial: {
        annual_savings: 0,
        annual_revenue: 0,
        payback_months: 0,
        three_year_impact: 0,
      },
      non_financial: {
        service_quality: '',
        efficiency_gains: '',
        risk_reduction: '',
        citizen_satisfaction: '',
        employee_impact: '',
      },
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  // Auto-calculate 3-year impact when annual values change
  useEffect(() => {
    const annualBenefit = roi.financial.annual_savings + roi.financial.annual_revenue
    const threeYearImpact = annualBenefit * 3

    setRoi((prev) => ({
      ...prev,
      financial: {
        ...prev.financial,
        three_year_impact: threeYearImpact,
      },
    }))
  }, [roi.financial.annual_savings, roi.financial.annual_revenue])

  const handleFinancialChange = (field: keyof RoiAnalysis['financial'], value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value)
    if (isNaN(numericValue)) return

    setRoi((prev) => ({
      ...prev,
      financial: {
        ...prev.financial,
        [field]: numericValue,
      },
    }))
  }

  const handleNonFinancialChange = (
    field: keyof RoiAnalysis['non_financial'],
    value: string
  ) => {
    setRoi((prev) => ({
      ...prev,
      non_financial: {
        ...prev.non_financial,
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(roi)
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

  const showPaybackWarning = roi.financial.payback_months > 36

  return (
    <div className="space-y-8">
      {/* Financial ROI Section */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Financial ROI</h3>
          <p className="mt-1 text-sm text-gray-500">
            Quantify expected financial returns and payback period
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Annual Savings */}
          <div>
            <Label htmlFor="annual_savings">Projected Annual Savings</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="annual_savings"
                type="number"
                min="0"
                step="1000"
                value={roi.financial.annual_savings || ''}
                onChange={(e) => handleFinancialChange('annual_savings', e.target.value)}
                disabled={disabled || isSaving}
                className="pl-7"
                placeholder="0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">e.g., reduced operating costs</p>
          </div>

          {/* Annual Revenue */}
          <div>
            <Label htmlFor="annual_revenue">Projected Annual Revenue Generation</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="annual_revenue"
                type="number"
                min="0"
                step="1000"
                value={roi.financial.annual_revenue || ''}
                onChange={(e) => handleFinancialChange('annual_revenue', e.target.value)}
                disabled={disabled || isSaving}
                className="pl-7"
                placeholder="0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">e.g., new fees or service charges</p>
          </div>
        </div>

        {/* Payback Period */}
        <div>
          <Label htmlFor="payback_months">Payback Period (months)</Label>
          <Input
            id="payback_months"
            type="number"
            min="0"
            step="1"
            value={roi.financial.payback_months || ''}
            onChange={(e) => handleFinancialChange('payback_months', e.target.value)}
            disabled={disabled || isSaving}
            className="mt-1 max-w-xs"
            placeholder="0"
          />
          {showPaybackWarning && (
            <div className="mt-2 flex items-start gap-2 text-sm text-orange-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Payback period exceeds 3-year plan cycle</span>
            </div>
          )}
        </div>

        {/* 3-Year Impact (Auto-calculated) */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">3-Year Net Financial Impact</h4>
              <p className="text-sm text-blue-700">(Auto-calculated)</p>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(roi.financial.three_year_impact)}
            </div>
          </div>
        </div>
      </div>

      {/* Non-Financial ROI Section */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-900">Non-Financial ROI</h3>
          <p className="mt-1 text-sm text-gray-500">
            Describe qualitative benefits and impacts
          </p>
        </div>

        {/* Service Quality Improvement */}
        <div>
          <Label htmlFor="service_quality">Service Quality Improvement</Label>
          <Textarea
            id="service_quality"
            value={roi.non_financial.service_quality}
            onChange={(e) => handleNonFinancialChange('service_quality', e.target.value)}
            disabled={disabled || isSaving}
            placeholder="Describe expected improvements to service quality, response times, accuracy, etc."
            rows={3}
            maxLength={500}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            {roi.non_financial.service_quality.length}/500 characters
          </p>
        </div>

        {/* Efficiency Gains */}
        <div>
          <Label htmlFor="efficiency_gains">Efficiency Gains</Label>
          <Textarea
            id="efficiency_gains"
            value={roi.non_financial.efficiency_gains}
            onChange={(e) => handleNonFinancialChange('efficiency_gains', e.target.value)}
            disabled={disabled || isSaving}
            placeholder="Describe time savings, process improvements, automation benefits, etc."
            rows={3}
            maxLength={500}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            {roi.non_financial.efficiency_gains.length}/500 characters
          </p>
        </div>

        {/* Risk Reduction */}
        <div>
          <Label htmlFor="risk_reduction">Risk Reduction</Label>
          <Textarea
            id="risk_reduction"
            value={roi.non_financial.risk_reduction}
            onChange={(e) => handleNonFinancialChange('risk_reduction', e.target.value)}
            disabled={disabled || isSaving}
            placeholder="Describe risks mitigated or eliminated, compliance improvements, safety enhancements, etc."
            rows={3}
            maxLength={500}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            {roi.non_financial.risk_reduction.length}/500 characters
          </p>
        </div>

        {/* Citizen Satisfaction Impact */}
        <div>
          <Label htmlFor="citizen_satisfaction">Citizen Satisfaction Impact</Label>
          <Textarea
            id="citizen_satisfaction"
            value={roi.non_financial.citizen_satisfaction}
            onChange={(e) =>
              handleNonFinancialChange('citizen_satisfaction', e.target.value)
            }
            disabled={disabled || isSaving}
            placeholder="Expected impact on citizen satisfaction scores, survey results, complaint reduction, etc."
            rows={3}
            maxLength={500}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            {roi.non_financial.citizen_satisfaction.length}/500 characters
          </p>
        </div>

        {/* Employee Impact */}
        <div>
          <Label htmlFor="employee_impact">Employee Impact</Label>
          <Textarea
            id="employee_impact"
            value={roi.non_financial.employee_impact}
            onChange={(e) => handleNonFinancialChange('employee_impact', e.target.value)}
            disabled={disabled || isSaving}
            placeholder="Impact on employee satisfaction, safety, workload, training opportunities, morale, etc."
            rows={3}
            maxLength={500}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            {roi.non_financial.employee_impact.length}/500 characters
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t border-gray-200 pt-4">
        <Button onClick={handleSave} disabled={disabled || isSaving}>
          {isSaving ? 'Saving...' : 'Save ROI Analysis'}
        </Button>
      </div>
    </div>
  )
}
