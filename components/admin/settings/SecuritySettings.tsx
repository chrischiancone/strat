'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { updateSecuritySettings } from '@/app/actions/settings'
import { securitySettingsSchema, type SecuritySettings as SecuritySettingsType } from '@/lib/validations/security'
import { 
  Shield, 
  Lock, 
  Key, 
  Clock, 
  AlertTriangle, 
  Users, 
  Eye,
  FileText,
  Activity
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: any
}

interface SecuritySettingsProps {
  municipality: Municipality
}

export function SecuritySettings({ municipality }: SecuritySettingsProps) {
  console.log('SecuritySettings loaded with municipality:', municipality)
  console.log('Municipality security settings:', municipality?.settings?.security)
  
  const initial: SecuritySettingsType = securitySettingsSchema.parse(
    municipality?.settings?.security ?? undefined
  )
  
  console.log('Parsed initial security settings:', initial)

  const [isPending, startTransition] = useTransition()
  const [auth, setAuth] = useState(initial.auth)
  const [access, setAccess] = useState(initial.access)
  const [audit, setAudit] = useState(initial.audit)
  const [session, setSession] = useState(initial.session)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    console.log('Save button clicked')
    setSaved(null)
    setError(null)
    const payload: SecuritySettingsType = { auth, access, audit, session }
    console.log('Payload to save:', payload)
    console.log('Municipality ID:', municipality.id)
    
    startTransition(async () => {
      try {
        const res = await updateSecuritySettings(municipality.id, payload)
        console.log('Server response:', res)
        if ((res as any)?.error) {
          console.error('Save error:', (res as any).error)
          setError((res as any).error)
        } else {
          console.log('Save successful')
          setSaved('Security settings updated successfully')
          // Auto-hide success message after 5 seconds
          setTimeout(() => setSaved(null), 5000)
        }
      } catch (error) {
        console.error('Exception during save:', error)
        setError('An unexpected error occurred while saving')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Security Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure authentication policies, access controls, and security monitoring.
        </p>
        {saved && <p className="mt-2 text-sm text-green-700">{saved}</p>}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>

      {/* Authentication Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-red-600" />
            Authentication Policies
          </CardTitle>
          <CardDescription>
            Configure password requirements and authentication settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Minimum Password Length</Label>
                <Input type="number" value={auth.minPasswordLength} onChange={(e) => setAuth({ ...auth, minPasswordLength: Number(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>Password Expiration (days)</Label>
                <Input type="number" value={auth.passwordExpirationDays} onChange={(e) => setAuth({ ...auth, passwordExpirationDays: Number(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>Max Login Attempts</Label>
                <Input type="number" value={auth.maxLoginAttempts} onChange={(e) => setAuth({ ...auth, maxLoginAttempts: Number(e.target.value) || 0 })} className="mt-1" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-gray-500">Passwords must include symbols</p>
                </div>
                <Switch checked={auth.requireSpecialChars} onCheckedChange={(v) => setAuth({ ...auth, requireSpecialChars: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for admin users</p>
                </div>
                <Switch checked={auth.requireTwoFactorAdmin} onCheckedChange={(v) => setAuth({ ...auth, requireTwoFactorAdmin: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SSO Integration</Label>
                  <p className="text-sm text-gray-500">Enable single sign-on</p>
                </div>
                <Switch checked={auth.ssoEnabled} onCheckedChange={(v) => setAuth({ ...auth, ssoEnabled: v })} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Access Control
          </CardTitle>
          <CardDescription>
            Manage role-based permissions and access restrictions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default User Role</Label>
                <p className="text-sm text-gray-500">Role assigned to new users</p>
              </div>
              <Select value={access.defaultUserRole} onValueChange={(v) => setAccess({ ...access, defaultUserRole: v as any })}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="department_director">Department Director</SelectItem>
                  <SelectItem value="city_manager">City Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve User Registration</Label>
                <p className="text-sm text-gray-500">Allow automatic user approval</p>
              </div>
              <Switch checked={access.autoApproveRegistration} onCheckedChange={(v) => setAccess({ ...access, autoApproveRegistration: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP Whitelist Protection</Label>
                <p className="text-sm text-gray-500">Restrict access by IP address</p>
              </div>
              <Switch checked={access.ipWhitelistEnabled} onCheckedChange={(v) => setAccess({ ...access, ipWhitelistEnabled: v })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit & Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Audit & Monitoring
          </CardTitle>
          <CardDescription>
            Configure security monitoring and audit trail settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Audit Logging</Label>
                <p className="text-sm text-gray-500">Track all user actions and changes</p>
              </div>
              <Switch checked={audit.enableAuditLogging} onCheckedChange={(v) => setAudit({ ...audit, enableAuditLogging: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Failed Login Notifications</Label>
                <p className="text-sm text-gray-500">Alert admins of failed login attempts</p>
              </div>
              <Switch checked={audit.failedLoginNotifications} onCheckedChange={(v) => setAudit({ ...audit, failedLoginNotifications: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Export Logging</Label>
                <p className="text-sm text-gray-500">Log all data exports and downloads</p>
              </div>
              <Switch checked={audit.dataExportLogging} onCheckedChange={(v) => setAudit({ ...audit, dataExportLogging: v })} />
            </div>
            <div>
              <Label>Audit Log Retention (days)</Label>
              <Input type="number" value={audit.retentionDays} onChange={(e) => setAudit({ ...audit, retentionDays: Number(e.target.value) || 0 })} className="mt-1 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Session Management
          </CardTitle>
          <CardDescription>
            Configure user session timeouts and concurrent session limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Session Timeout (minutes)</Label>
              <Input type="number" value={session.timeoutMinutes} onChange={(e) => setSession({ ...session, timeoutMinutes: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div>
              <Label>Max Concurrent Sessions</Label>
              <Input type="number" value={session.maxConcurrentSessions} onChange={(e) => setSession({ ...session, maxConcurrentSessions: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div>
              <Label>Remember Me Duration (days)</Label>
              <Input type="number" value={session.rememberMeDays} onChange={(e) => setSession({ ...session, rememberMeDays: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="flex items-center gap-2" onClick={handleSave} disabled={isPending}>
          <Shield className="h-4 w-4" />
          {isPending ? 'Saving...' : 'Update Security Settings'}
        </Button>
      </div>
    </div>
  )
}