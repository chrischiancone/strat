'use client'

import { useState, useEffect } from 'react'
import { updateNotificationSettings } from '@/app/actions/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  HardDrive,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  Settings,
  Users,
  Calendar,
  Database,
  Server
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    notifications?: {
      backup?: {
        success_email?: string
        failure_email?: string
        send_reports?: boolean
        report_frequency?: 'daily' | 'weekly' | 'monthly'
      }
      system?: {
        maintenance_email?: string
        error_email?: string
        security_email?: string
        notify_maintenance?: boolean
        notify_errors?: boolean
        notify_security?: boolean
      }
      smtp?: {
        host?: string
        port?: number
        secure?: boolean
        user?: string
        from_email?: string
        from_name?: string
      }
    }
  } | null
}

interface NotificationSettingsProps {
  municipality: Municipality
}

export function NotificationSettings({ municipality }: NotificationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testingEmail, setTestingEmail] = useState(false)
  
  // Current notification settings
  const currentSettings = municipality.settings?.notifications || {}
  const [settings, setSettings] = useState({
    backup: {
      success_email: '',
      failure_email: '',
      send_reports: true,
      report_frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
      ...currentSettings.backup
    },
    system: {
      maintenance_email: '',
      error_email: '',
      security_email: '',
      notify_maintenance: true,
      notify_errors: true,
      notify_security: true,
      ...currentSettings.system
    },
    smtp: {
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      user: '',
      from_email: `no-reply@${municipality.slug}.gov`,
      from_name: `${municipality.name} System`,
      ...currentSettings.smtp
    }
  })

  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const result = await updateNotificationSettings(municipality.id, settings)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Notification settings updated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to save notification settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    setError(null)
    
    try {
      const testRecipient = settings.backup.success_email || settings.system.error_email
      if (!testRecipient) {
        throw new Error('Please configure at least one email address first')
      }
      
      // Send test notification
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: testRecipient,
          municipalityId: municipality.id
        })
      })
      
      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error || 'Failed to send test email')
      }
      
      setSuccess(`Test email sent to ${testRecipient}!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email')
    } finally {
      setTestingEmail(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600" />
          Notification Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure email notifications, alerts, and communication settings for system events.
        </p>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* Backup Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-emerald-600" />
            Backup Notifications
          </CardTitle>
          <CardDescription>
            Configure notifications for backup operations, success, and failures.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backup-success-email">Success Notifications</Label>
              <Input
                id="backup-success-email"
                type="email"
                placeholder="admin@municipality.gov"
                value={settings.backup.success_email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  backup: { ...prev.backup, success_email: e.target.value }
                }))}
              />
              <p className="text-xs text-gray-500">
                Email addresses to notify when backups complete successfully (comma-separated)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-failure-email">Failure Notifications</Label>
              <Input
                id="backup-failure-email"
                type="email"
                placeholder="alerts@municipality.gov"
                value={settings.backup.failure_email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  backup: { ...prev.backup, failure_email: e.target.value }
                }))}
              />
              <p className="text-xs text-gray-500">
                Email addresses to notify when backups fail (comma-separated)
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="backup-reports">Send Backup Reports</Label>
              <p className="text-sm text-gray-600">Receive periodic backup status reports</p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={settings.backup.report_frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, report_frequency: value }
                  }))
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Switch
                id="backup-reports"
                checked={settings.backup.send_reports}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  backup: { ...prev.backup, send_reports: checked }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            System Notifications
          </CardTitle>
          <CardDescription>
            Configure notifications for system maintenance, errors, and security events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance-email">Maintenance Notifications</Label>
              <Input
                id="maintenance-email"
                type="email"
                placeholder="maintenance@municipality.gov"
                value={settings.system.maintenance_email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, maintenance_email: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="error-email">Error Notifications</Label>
              <Input
                id="error-email"
                type="email"
                placeholder="errors@municipality.gov"
                value={settings.system.error_email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, error_email: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-email">Security Notifications</Label>
              <Input
                id="security-email"
                type="email"
                placeholder="security@municipality.gov"
                value={settings.system.security_email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, security_email: e.target.value }
                }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="notify-maintenance">Maintenance Alerts</Label>
                <p className="text-xs text-gray-600">System maintenance notifications</p>
              </div>
              <Switch
                id="notify-maintenance"
                checked={settings.system.notify_maintenance}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, notify_maintenance: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="notify-errors">Error Alerts</Label>
                <p className="text-xs text-gray-600">System error notifications</p>
              </div>
              <Switch
                id="notify-errors"
                checked={settings.system.notify_errors}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, notify_errors: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="notify-security">Security Alerts</Label>
                <p className="text-xs text-gray-600">Security event notifications</p>
              </div>
              <Switch
                id="notify-security"
                checked={settings.system.notify_security}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, notify_security: checked }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>
            Configure email server settings for sending notifications.
            <Badge variant="outline" className="ml-2">Development</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                value={settings.smtp.host}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, host: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="number"
                value={settings.smtp.port}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, port: parseInt(e.target.value) || 1025 }
                }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-from-email">From Email</Label>
              <Input
                id="smtp-from-email"
                type="email"
                value={settings.smtp.from_email}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, from_email: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-from-name">From Name</Label>
              <Input
                id="smtp-from-name"
                value={settings.smtp.from_name}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  smtp: { ...prev.smtp, from_name: e.target.value }
                }))}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
              <p className="text-sm text-gray-600">Enable secure connection to SMTP server</p>
            </div>
            <Switch
              id="smtp-secure"
              checked={settings.smtp.secure}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                smtp: { ...prev.smtp, secure: checked }
              }))}
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Development Mode</p>
                <p className="text-xs text-amber-700 mt-1">
                  Using Mailpit for local development. View emails at{' '}
                  <a href="http://127.0.0.1:54324" target="_blank" rel="noopener" className="underline">
                    http://127.0.0.1:54324
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleTestEmail}
          disabled={testingEmail}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {testingEmail ? 'Sending...' : 'Send Test Email'}
        </Button>
        
        <Button
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
