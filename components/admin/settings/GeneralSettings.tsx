'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateMunicipalitySchema, type UpdateMunicipalityInput } from '@/lib/validations/municipality'
import { updateMunicipality } from '@/app/actions/municipality'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  Save,
  Check,
  AlertCircle
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    contact_name?: string
    contact_email?: string
    contact_phone?: string
    website_url?: string
    timezone?: string
    fiscal_year_start_month?: number
    currency?: string
    features?: {
      ai_assistance?: boolean
      public_dashboard?: boolean
      multi_department_collaboration?: boolean
    }
  } | null
}

interface GeneralSettingsProps {
  municipality: Municipality
}

export function GeneralSettings({ municipality }: GeneralSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    control,
  } = useForm<UpdateMunicipalityInput>({
    resolver: zodResolver(updateMunicipalitySchema),
    defaultValues: {
      name: municipality.name,
      state: municipality.state || '',
      contactName: municipality.settings?.contact_name || '',
      contactEmail: municipality.settings?.contact_email || '',
      contactPhone: municipality.settings?.contact_phone || '',
      websiteUrl: municipality.settings?.website_url || '',
      timezone: municipality.settings?.timezone || 'America/Chicago',
      currency: municipality.settings?.currency || 'USD',
      fiscalYearStartMonth: municipality.settings?.fiscal_year_start_month || 10,
      aiAssistance: municipality.settings?.features?.ai_assistance || false,
      publicDashboard: municipality.settings?.features?.public_dashboard || false,
      multiDepartmentCollaboration: municipality.settings?.features?.multi_department_collaboration ?? true,
    },
  })

  const onSubmit = async (data: UpdateMunicipalityInput) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateMunicipality(municipality.id, data)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setIsSubmitting(false)
    } catch {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  ]

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
  ]

  const fiscalYearMonths = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          General Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure basic municipality information, contact details, and system preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="h-4 w-4" />
                <span className="text-sm">Settings updated successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential municipality details and public information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Municipality Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="City of Example"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="Texas"
                  className="mt-1"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Contact Person</Label>
                <div className="relative">
                  <Input
                    id="contactName"
                    {...register('contactName')}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="admin@example.gov"
                    className="mt-1 pl-10"
                  />
                </div>
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactPhone"
                    type="tel"
                    {...register('contactPhone')}
                    placeholder="(555) 123-4567"
                    className="mt-1 pl-10"
                  />
                </div>
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="websiteUrl"
                    type="url"
                    {...register('websiteUrl')}
                    placeholder="https://example.gov"
                    className="mt-1 pl-10"
                  />
                </div>
                {errors.websiteUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.websiteUrl.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Configure timezone, fiscal year settings, and regional preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Timezone</Label>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label>Currency</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label>Fiscal Year Start</Label>
                <Controller
                  name="fiscalYearStartMonth"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      value={String(field.value)} 
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {fiscalYearMonths.map((month) => (
                          <SelectItem key={month.value} value={String(month.value)}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="h-5 w-5 bg-purple-600" />
              Platform Features
            </CardTitle>
            <CardDescription>
              Enable or disable specific features for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Assistance</Label>
                  <p className="text-sm text-gray-500">
                    Enable AI-powered insights and analysis features
                  </p>
                </div>
                <Controller
                  name="aiAssistance"
                  control={control}
                  render={({ field }) => (
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Dashboard</Label>
                  <p className="text-sm text-gray-500">
                    Allow public access to read-only dashboard views
                  </p>
                </div>
                <Controller
                  name="publicDashboard"
                  control={control}
                  render={({ field }) => (
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Multi-Department Collaboration</Label>
                  <p className="text-sm text-gray-500">
                    Enable cross-department initiative collaboration
                  </p>
                </div>
                <Controller
                  name="multiDepartmentCollaboration"
                  control={control}
                  render={({ field }) => (
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}