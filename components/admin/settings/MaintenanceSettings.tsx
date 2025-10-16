'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  AlertTriangle, 
  Power, 
  RefreshCw, 
  Database,
  Activity,
  Clock,
  Shield,
  Server,
  HardDrive,
  Wifi,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  PlayCircle,
  PauseCircle,
  Calendar,
  Bell,
  FileText,
  Trash2,
  Archive,
  RotateCcw,
  Zap
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    maintenance?: {
      mode_enabled: boolean
      scheduled_maintenance?: {
        enabled: boolean
        start_time?: string
        end_time?: string
        recurrence?: 'once' | 'daily' | 'weekly' | 'monthly'
        notification_hours_before?: number
      }
      custom_message?: string
      allowed_ips?: string[]
      bypass_roles?: string[]
      health_checks?: {
        enabled: boolean
        database_check: boolean
        storage_check: boolean
        api_check: boolean
        external_services_check: boolean
        check_interval_minutes: number
        alert_on_failure: boolean
      }
      system_operations?: {
        auto_cleanup_enabled: boolean
        cleanup_schedule: string
        log_retention_days: number
        session_timeout_minutes: number
        max_upload_size_mb: number
      }
      emergency_contacts?: {
        primary_email: string
        secondary_email: string
        phone: string
        escalation_enabled: boolean
      }
    }
  } | null
}

interface MaintenanceSettingsProps {
  municipality: Municipality
}

export function MaintenanceSettings({ municipality }: MaintenanceSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Current maintenance settings
  const currentSettings = municipality.settings?.maintenance || {}
  const [settings, setSettings] = useState({
    mode_enabled: currentSettings.mode_enabled || false,
    scheduled_maintenance: {
      enabled: false,
      start_time: '',
      end_time: '',
      recurrence: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
      notification_hours_before: 24,
      ...currentSettings.scheduled_maintenance
    },
    custom_message: currentSettings.custom_message || 'The system is currently undergoing maintenance. Please check back soon.',
    allowed_ips: currentSettings.allowed_ips || [],
    bypass_roles: currentSettings.bypass_roles || ['admin', 'super_admin'],
    health_checks: {
      enabled: true,
      database_check: true,
      storage_check: true,
      api_check: true,
      external_services_check: true,
      check_interval_minutes: 5,
      alert_on_failure: true,
      ...currentSettings.health_checks
    },
    system_operations: {
      auto_cleanup_enabled: true,
      cleanup_schedule: '0 2 * * *', // 2 AM daily (cron format)
      log_retention_days: 30,
      session_timeout_minutes: 60,
      max_upload_size_mb: 10,
      ...currentSettings.system_operations
    },
    emergency_contacts: {
      primary_email: '',
      secondary_email: '',
      phone: '',
      escalation_enabled: true,
      ...currentSettings.emergency_contacts
    }
  })

  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { updateMaintenanceSettings } = await import('@/app/actions/settings')
      const result = await updateMaintenanceSettings(municipality.id, settings)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Maintenance settings updated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to save maintenance settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleMaintenanceMode = async () => {
    const newModeEnabled = !settings.mode_enabled
    setSettings(prev => ({ ...prev, mode_enabled: newModeEnabled }))
    
    // Immediately save the maintenance mode toggle
    try {
      const { updateMaintenanceSettings } = await import('@/app/actions/settings')
      await updateMaintenanceSettings(municipality.id, { ...settings, mode_enabled: newModeEnabled })
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err)
    }
  }

  const addAllowedIP = () => {
    const newIP = prompt('Enter IP address to allow during maintenance:')
    if (newIP && newIP.trim()) {
      setSettings(prev => ({
        ...prev,
        allowed_ips: [...prev.allowed_ips, newIP.trim()]
      }))
    }
  }

  const removeAllowedIP = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      allowed_ips: prev.allowed_ips.filter(i => i !== ip)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-orange-600" />
          Maintenance Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure maintenance mode, system health monitoring, and operational parameters.
        </p>
      </div>

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
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Mode Alert */}
      {settings.mode_enabled && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">Maintenance Mode Active</h3>
                <p className="text-sm text-orange-800">
                  The system is currently in maintenance mode. Only administrators and whitelisted IPs can access the application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="mode" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="mode" className="text-xs md:text-sm">Maintenance Mode</TabsTrigger>
          <TabsTrigger value="health" className="text-xs md:text-sm">Health Checks</TabsTrigger>
          <TabsTrigger value="operations" className="text-xs md:text-sm">System Operations</TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs md:text-sm">Emergency Contacts</TabsTrigger>
        </TabsList>

        {/* Maintenance Mode Tab */}
        <TabsContent value="mode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5 text-orange-600" />
                Maintenance Mode Control
              </CardTitle>
              <CardDescription>
                Enable maintenance mode to restrict access during system updates or repairs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {settings.mode_enabled ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <PauseCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                    Maintenance Mode
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {settings.mode_enabled 
                      ? 'System is currently in maintenance mode'
                      : 'System is operating normally'
                    }
                  </p>
                </div>
                <Switch
                  checked={settings.mode_enabled}
                  onCheckedChange={handleToggleMaintenanceMode}
                />
              </div>

              <Separator />

              {/* Custom Message */}
              <div className="space-y-2">
                <Label>Maintenance Message</Label>
                <p className="text-xs text-gray-500">
                  This message will be displayed to users during maintenance mode.
                </p>
                <Textarea
                  value={settings.custom_message}
                  onChange={(e) => setSettings(prev => ({ ...prev, custom_message: e.target.value }))}
                  placeholder="Enter maintenance message..."
                  rows={3}
                  className="text-sm"
                />
              </div>

              {/* Allowed IPs */}
              <div>
                <Label>Allowed IP Addresses</Label>
                <p className="text-xs text-gray-500 mb-2">
                  These IPs can access the system even during maintenance mode.
                </p>
                <div className="space-y-2">
                  {settings.allowed_ips.map((ip, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <code className="flex-1 text-sm">{ip}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAllowedIP(ip)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addAllowedIP}
                    className="w-full"
                  >
                    Add IP Address
                  </Button>
                </div>
              </div>

              {/* Scheduled Maintenance */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Scheduled Maintenance</Label>
                    <p className="text-xs text-gray-500">
                      Automatically enable maintenance mode at specific times.
                    </p>
                  </div>
                  <Switch
                    checked={settings.scheduled_maintenance.enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      scheduled_maintenance: { ...prev.scheduled_maintenance, enabled: checked }
                    }))}
                  />
                </div>

                {settings.scheduled_maintenance.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="datetime-local"
                        value={settings.scheduled_maintenance.start_time}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          scheduled_maintenance: { ...prev.scheduled_maintenance, start_time: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="datetime-local"
                        value={settings.scheduled_maintenance.end_time}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          scheduled_maintenance: { ...prev.scheduled_maintenance, end_time: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Recurrence</Label>
                      <Select
                        value={settings.scheduled_maintenance.recurrence}
                        onValueChange={(value: 'once' | 'daily' | 'weekly' | 'monthly') => setSettings(prev => ({
                          ...prev,
                          scheduled_maintenance: { ...prev.scheduled_maintenance, recurrence: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notify Before (hours)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="168"
                        value={settings.scheduled_maintenance.notification_hours_before}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          scheduled_maintenance: { 
                            ...prev.scheduled_maintenance, 
                            notification_hours_before: parseInt(e.target.value) || 24 
                          }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Checks Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                System Health Monitoring
              </CardTitle>
              <CardDescription>
                Configure automated health checks and monitoring alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Health Checks</Label>
                  <p className="text-xs text-gray-500">
                    Automatically monitor system components for issues.
                  </p>
                </div>
                <Switch
                  checked={settings.health_checks.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    health_checks: { ...prev.health_checks, enabled: checked }
                  }))}
                />
              </div>

              {settings.health_checks.enabled && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Check Components</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Database Connection</span>
                        </div>
                        <Switch
                          checked={settings.health_checks.database_check}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            health_checks: { ...prev.health_checks, database_check: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">Storage Availability</span>
                        </div>
                        <Switch
                          checked={settings.health_checks.storage_check}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            health_checks: { ...prev.health_checks, storage_check: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-green-600" />
                          <span className="text-sm">API Endpoints</span>
                        </div>
                        <Switch
                          checked={settings.health_checks.api_check}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            health_checks: { ...prev.health_checks, api_check: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">External Services</span>
                        </div>
                        <Switch
                          checked={settings.health_checks.external_services_check}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            health_checks: { ...prev.health_checks, external_services_check: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Check Interval (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.health_checks.check_interval_minutes}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          health_checks: { 
                            ...prev.health_checks, 
                            check_interval_minutes: parseInt(e.target.value) || 5 
                          }
                        }))}
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center gap-2 flex-1">
                        <Switch
                          checked={settings.health_checks.alert_on_failure}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            health_checks: { ...prev.health_checks, alert_on_failure: checked }
                          }))}
                        />
                        <Label className="cursor-pointer">Alert on Failure</Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                System Operations
              </CardTitle>
              <CardDescription>
                Configure automated cleanup, logging, and operational parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Cleanup */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Cleanup</Label>
                    <p className="text-xs text-gray-500">
                      Automatically remove old logs and temporary files.
                    </p>
                  </div>
                  <Switch
                    checked={settings.system_operations.auto_cleanup_enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      system_operations: { ...prev.system_operations, auto_cleanup_enabled: checked }
                    }))}
                  />
                </div>

                {settings.system_operations.auto_cleanup_enabled && (
                  <div>
                    <Label>Cleanup Schedule (Cron Format)</Label>
                    <Input
                      value={settings.system_operations.cleanup_schedule}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        system_operations: { ...prev.system_operations, cleanup_schedule: e.target.value }
                      }))}
                      placeholder="0 2 * * * (2 AM daily)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: minute hour day month weekday
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Operational Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Log Retention (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.system_operations.log_retention_days}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      system_operations: { 
                        ...prev.system_operations, 
                        log_retention_days: parseInt(e.target.value) || 30 
                      }
                    }))}
                  />
                </div>

                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.system_operations.session_timeout_minutes}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      system_operations: { 
                        ...prev.system_operations, 
                        session_timeout_minutes: parseInt(e.target.value) || 60 
                      }
                    }))}
                  />
                </div>

                <div>
                  <Label>Max Upload Size (MB)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.system_operations.max_upload_size_mb}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      system_operations: { 
                        ...prev.system_operations, 
                        max_upload_size_mb: parseInt(e.target.value) || 10 
                      }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                Configure emergency contact information for critical system alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Primary Email</Label>
                <Input
                  type="email"
                  value={settings.emergency_contacts.primary_email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    emergency_contacts: { ...prev.emergency_contacts, primary_email: e.target.value }
                  }))}
                  placeholder="primary@example.com"
                />
              </div>

              <div>
                <Label>Secondary Email</Label>
                <Input
                  type="email"
                  value={settings.emergency_contacts.secondary_email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    emergency_contacts: { ...prev.emergency_contacts, secondary_email: e.target.value }
                  }))}
                  placeholder="secondary@example.com"
                />
              </div>

              <div>
                <Label>Emergency Phone</Label>
                <Input
                  type="tel"
                  value={settings.emergency_contacts.phone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    emergency_contacts: { ...prev.emergency_contacts, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Escalation</Label>
                  <p className="text-xs text-gray-500">
                    Automatically contact secondary contacts if primary doesn't respond.
                  </p>
                </div>
                <Switch
                  checked={settings.emergency_contacts.escalation_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    emergency_contacts: { ...prev.emergency_contacts, escalation_enabled: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleSaveSettings}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
