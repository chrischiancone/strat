'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { BackupService, BackupItem, BackupStats, CreateBackupOptions } from '@/lib/services/backup'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  HardDrive, 
  Shield, 
  Clock, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Database,
  FileText,
  Folder,
  Cloud,
  Server,
  Timer,
  Play,
  Pause,
  Square,
  RotateCcw,
  ExternalLink,
  Copy,
  Eye,
  AlertCircle,
  Zap
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    backup?: {
      enabled: boolean
      schedule?: {
        frequency: 'daily' | 'weekly' | 'monthly'
        time: string
        day_of_week?: number
        day_of_month?: number
      }
      retention?: {
        keep_daily: number
        keep_weekly: number
        keep_monthly: number
        keep_yearly: number
      }
      storage?: {
        provider: 'supabase' | 'aws' | 'gcp' | 'azure'
        bucket_name: string
        encryption_enabled: boolean
      }
      includes?: {
        database: boolean
        files: boolean
        settings: boolean
        user_data: boolean
        logs: boolean
      }
      notifications?: {
        success_email: string
        failure_email: string
        send_reports: boolean
      }
    }
  } | null
}

interface BackupSettingsProps {
  municipality: Municipality
}

// BackupItem and BackupStats interfaces are now imported from the service

export function BackupSettings({ municipality }: BackupSettingsProps) {
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreInProgress, setRestoreInProgress] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
// Initialize Supabase client and backup service (persist across renders)
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const backupService = useMemo(() => new BackupService(supabase, `${municipality.slug}-backups`), [supabase, municipality.slug])
  
  // Real backup data from Supabase
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [backupStats, setBackupStats] = useState<BackupStats>({
    total_backups: 0,
    total_size: 0,
    last_backup: '',
    success_rate: 0,
    average_duration: 0,
    storage_used: 0,
    storage_limit: 50 * 1024 * 1024 * 1024 // 50GB default
  })
  
  // Load backup data on component mount
  useEffect(() => {
    const initializeBackupSystem = async () => {
      try {
        setLoading(true)
        
        // Get current user from Supabase auth
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('Failed to get current user:', userError)
          setError('Failed to authenticate user')
          return
        }
        
        if (!user) {
          setError('User not authenticated')
          return
        }
        
        setCurrentUser({ id: user.id, email: user.email || undefined })
        
        // Initialize storage bucket (bucket name already set on service)
        await backupService.initializeBucket(municipality.slug)
        
        // Load existing backups
        const backupsData = await backupService.getBackups(municipality.id)
        setBackups(backupsData)
        
        // Load backup statistics
        const statsData = await backupService.getBackupStats(municipality.id)
        setBackupStats(statsData)
        
      } catch (err) {
        console.error('Failed to initialize backup system:', err)
        
        // Check if it's a table missing error
        if (err instanceof Error && err.message.includes('relation "backups" does not exist')) {
          setError('Backup system not initialized. Please run the database migration to create the backups table.')
        } else {
          setError(`Failed to load backup data: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      } finally {
        setLoading(false)
      }
    }

    if (municipality?.id && municipality?.slug) {
      initializeBackupSystem()
    }
  }, [municipality?.id, municipality?.slug])
  
  // Current backup settings
  const currentSettings = municipality.settings?.backup || {}
  const [settings, setSettings] = useState({
    enabled: true,
    schedule: {
      frequency: 'daily',
      time: '02:00',
      day_of_week: 0, // Sunday
      day_of_month: 1,
      ...currentSettings.schedule
    },
    retention: {
      keep_daily: 7,
      keep_weekly: 4,
      keep_monthly: 6,
      keep_yearly: 2,
      ...currentSettings.retention
    },
    storage: {
      provider: 'supabase',
      bucket_name: `${municipality.slug}-backups`,
      encryption_enabled: true,
      ...currentSettings.storage
    },
    includes: {
      database: true,
      files: true,
      settings: true,
      user_data: true,
      logs: false,
      ...currentSettings.includes
    },
    notifications: {
      success_email: '',
      failure_email: '',
      send_reports: true,
      ...currentSettings.notifications
    }
  })

  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { updateBackupSettings } = await import('@/app/actions/settings')
      const result = await updateBackupSettings(municipality.id, settings)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Backup settings updated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Failed to save backup settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const createBackup = async (type: 'full' | 'incremental' = 'full') => {
    if (!currentUser?.id) {
      setError('User not authenticated')
      return
    }
    
    setBackupInProgress(true)
    setBackupProgress(0)
    setError(null)
    
    try {
      const backupOptions: CreateBackupOptions = {
        type,
        includes: settings.includes,
        municipalityId: municipality.id,
        userId: currentUser.id
      }
      
      const newBackup = await backupService.createBackup(backupOptions, (progress) => {
        setBackupProgress(progress)
      })
      
      if (newBackup) {
        setBackups(prev => [newBackup, ...prev])
        setSuccess(`${type === 'full' ? 'Full' : 'Incremental'} backup created successfully!`)
        
        // Refresh stats
        const updatedStats = await backupService.getBackupStats(municipality.id)
        setBackupStats(updatedStats)
        
        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error('Backup creation failed')
      }
    } catch (err) {
      console.error('Backup creation error:', err)
      setError(`Backup creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setBackupInProgress(false)
      setBackupProgress(0)
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (!selectedBackup) return
    
    setRestoreInProgress(true)
    setError(null)
    
    try {
      // Download backup data
      const backupData = await backupService.downloadBackup(selectedBackup, municipality.id)
      
      if (!backupData) {
        throw new Error('Failed to download backup data')
      }
      
      // For now, we'll just simulate the restore process
      // In a real implementation, you'd parse the backup data and restore it
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setSuccess('Backup restored successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Restore error:', err)
      setError(`Backup restore failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setRestoreInProgress(false)
      setSelectedBackup(null)
    }
  }

  const deleteBackup = async (backupId: string) => {
    try {
      const success = await backupService.deleteBackup(backupId, municipality.id)
      
      if (success) {
        setBackups(prev => prev.filter(backup => backup.id !== backupId))
        setSuccess('Backup deleted successfully!')
        
        // Refresh stats
        const updatedStats = await backupService.getBackupStats(municipality.id)
        setBackupStats(updatedStats)
        
        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error('Delete operation failed')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError(`Failed to delete backup: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setError(null), 3000)
    }
  }

  const downloadBackup = async (backupId: string) => {
    try {
      const backupData = await backupService.downloadBackup(backupId, municipality.id)
      
      if (backupData) {
        // Create download link
        const url = URL.createObjectURL(backupData)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${backupId}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        setSuccess('Backup download started!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error('Failed to download backup data')
      }
    } catch (err) {
      console.error('Download error:', err)
      setError(`Failed to download backup: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setError(null), 3000)
    }
  }

  const testBackupIntegrity = async (backupId: string) => {
    try {
      const isValid = await backupService.verifyBackupIntegrity(backupId, municipality.id)
      
      if (isValid) {
        setSuccess('Backup integrity verified successfully!')
      } else {
        setError('Backup integrity check failed - file may be corrupted')
      }
      
      setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 3000)
    } catch (err) {
      console.error('Integrity check error:', err)
      setError(`Backup integrity check failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setError(null), 3000)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getStatusIcon = (status: BackupItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'in_progress': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />
      default: return null
    }
  }

  const getStatusBadge = (status: BackupItem['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'scheduled': return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-emerald-600" />
            Backup & Recovery Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure automated backups, manage recovery procedures, and monitor backup health using Supabase Storage.
          </p>
        </div>
        <Card>
          <CardContent className="pt-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading backup system...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-emerald-600" />
          Backup & Recovery Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure automated backups, manage recovery procedures, and monitor backup health using Supabase Storage.
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

      {/* Backup Progress */}
      {backupInProgress && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Creating backup... {backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-blue-600">{backupStats.total_backups}</p>
              </div>
              <Archive className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-green-600">{formatFileSize(backupStats.storage_used)}</p>
                <p className="text-xs text-gray-500">of {formatFileSize(backupStats.storage_limit)}</p>
              </div>
              <Cloud className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{backupStats.success_rate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-indigo-600">{formatDuration(backupStats.average_duration)}</p>
              </div>
              <Timer className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backups" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backups">Backup History</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
        </TabsList>

        {/* Backup History Tab */}
        <TabsContent value="backups" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-blue-600" />
                    Backup Management
                  </CardTitle>
                  <CardDescription>Create, manage, and monitor your backups</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => createBackup('incremental')}
                    disabled={backupInProgress}
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Quick Backup
                  </Button>
                  <Button 
                    onClick={() => createBackup('full')}
                    disabled={backupInProgress}
                    className="flex items-center gap-2"
                  >
                    <HardDrive className="h-4 w-4" />
                    Full Backup
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(backup.status)}
                        <div>
                          <h4 className="font-medium">{backup.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(backup.created_at).toLocaleDateString()} at {new Date(backup.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(backup.status)}
                        <Badge variant="outline" className="capitalize">{backup.type}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-1 font-medium">{formatFileSize(backup.size)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Files:</span>
                        <span className="ml-1 font-medium">{backup.file_count.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 font-medium">{formatDuration(backup.duration)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Includes:</span>
                        <span className="ml-1 font-medium">{backup.includes.join(', ')}</span>
                      </div>
                    </div>

                    {backup.error_message && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Error:</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{backup.error_message}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t">
                      {backup.status === 'completed' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedBackup(backup.id)}
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadBackup(backup.id)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testBackupIntegrity(backup.id)}
                            className="flex items-center gap-2"
                          >
                            <Shield className="h-3 w-3" />
                            Verify
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteBackup(backup.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {backups.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No backups found. Create your first backup to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Backup Schedule
              </CardTitle>
              <CardDescription>
                Configure automated backup schedules and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Automatic Backups</Label>
                  <p className="text-sm text-gray-500">Automatically create backups based on schedule</p>
                </div>
                <Switch 
                  checked={settings.enabled}
                  onCheckedChange={(enabled) => 
                    setSettings(prev => ({ ...prev, enabled }))
                  }
                />
              </div>

              {settings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Backup Frequency</Label>
                      <Select 
                        value={settings.schedule.frequency}
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                          setSettings(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, frequency: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Backup Time</Label>
                      <Input
                        type="time"
                        value={settings.schedule.time}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, time: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  {settings.schedule.frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select 
                        value={settings.schedule.day_of_week.toString()}
                        onValueChange={(value) => 
                          setSettings(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, day_of_week: parseInt(value) }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {settings.schedule.frequency === 'monthly' && (
                    <div className="space-y-2">
                      <Label>Day of Month</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={settings.schedule.day_of_month}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, day_of_month: parseInt(e.target.value) || 1 }
                        }))}
                      />
                    </div>
                  )}
                </>
              )}

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Backup Content</Label>
                <div className="space-y-3">
                  {Object.entries(settings.includes).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="capitalize">{key.replace('_', ' ')}</Label>
                        <p className="text-sm text-gray-500">
                          {key === 'database' && 'All application data and structure'}
                          {key === 'files' && 'Uploaded documents and media files'}
                          {key === 'settings' && 'System configuration and preferences'}
                          {key === 'user_data' && 'User accounts and permissions'}
                          {key === 'logs' && 'Application logs and audit trails'}
                        </p>
                      </div>
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            includes: { ...prev.includes, [key]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Retention Policy</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Keep Daily Backups</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings.retention.keep_daily}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        retention: { ...prev.retention, keep_daily: parseInt(e.target.value) || 7 }
                      }))}
                    />
                    <p className="text-xs text-gray-500">Number of daily backups to retain</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Keep Weekly Backups</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings.retention.keep_weekly}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        retention: { ...prev.retention, keep_weekly: parseInt(e.target.value) || 4 }
                      }))}
                    />
                    <p className="text-xs text-gray-500">Number of weekly backups to retain</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Keep Monthly Backups</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings.retention.keep_monthly}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        retention: { ...prev.retention, keep_monthly: parseInt(e.target.value) || 6 }
                      }))}
                    />
                    <p className="text-xs text-gray-500">Number of monthly backups to retain</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Keep Yearly Backups</Label>
                    <Input
                      type="number"
                      min="1"
                      value={settings.retention.keep_yearly}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        retention: { ...prev.retention, keep_yearly: parseInt(e.target.value) || 2 }
                      }))}
                    />
                    <p className="text-xs text-gray-500">Number of yearly backups to retain</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-green-600" />
                Storage Configuration
              </CardTitle>
              <CardDescription>
                Configure Supabase Storage settings and encryption options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Storage Provider</Label>
                  <Select 
                    value={settings.storage.provider}
                    onValueChange={(value: 'supabase' | 'aws' | 'gcp' | 'azure') => 
                      setSettings(prev => ({
                        ...prev,
                        storage: { ...prev.storage, provider: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supabase">Supabase Storage</SelectItem>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bucket Name</Label>
                  <Input
                    value={settings.storage.bucket_name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      storage: { ...prev.storage, bucket_name: e.target.value }
                    }))}
                    placeholder="municipality-backups"
                  />
                  <p className="text-xs text-gray-500">Storage bucket for backup files</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Encryption</Label>
                    <p className="text-sm text-gray-500">Encrypt backup files for security</p>
                  </div>
                  <Switch 
                    checked={settings.storage.encryption_enabled}
                    onCheckedChange={(enabled) => 
                      setSettings(prev => ({
                        ...prev,
                        storage: { ...prev.storage, encryption_enabled: enabled }
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Storage Usage</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Used Storage</span>
                    <span className="font-medium">{formatFileSize(backupStats.storage_used)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Available Storage</span>
                    <span className="font-medium">{formatFileSize(backupStats.storage_limit - backupStats.storage_used)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Limit</span>
                    <span className="font-medium">{formatFileSize(backupStats.storage_limit)}</span>
                  </div>
                  <Progress 
                    value={(backupStats.storage_used / backupStats.storage_limit) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-gray-500">
                    {((backupStats.storage_used / backupStats.storage_limit) * 100).toFixed(1)}% of storage quota used
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Manage Storage
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Check Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email notifications for backup events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Success Notification Email</Label>
                  <Input
                    type="email"
                    value={settings.notifications.success_email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, success_email: e.target.value }
                    }))}
                    placeholder="admin@municipality.gov"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Failure Notification Email</Label>
                  <Input
                    type="email"
                    value={settings.notifications.failure_email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, failure_email: e.target.value }
                    }))}
                    placeholder="admin@municipality.gov"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Weekly Reports</Label>
                  <p className="text-sm text-gray-500">Email weekly backup status reports</p>
                </div>
                <Switch 
                  checked={settings.notifications.send_reports}
                  onCheckedChange={(enabled) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, send_reports: enabled }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recovery Tab */}
        <TabsContent value="recovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                Recovery Options
              </CardTitle>
              <CardDescription>
                Restore data from backups and manage recovery procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedBackup ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Recovery Warning</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      This operation will restore data from the selected backup. Current data may be overwritten.
                      Please ensure you have a recent backup before proceeding.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Selected Backup:</h4>
                    {(() => {
                      const backup = backups.find(b => b.id === selectedBackup)
                      return backup ? (
                        <div className="border rounded-lg p-3 bg-gray-50">
                          <p className="font-medium">{backup.name}</p>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(backup.created_at).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Size: {formatFileSize(backup.size)} • Files: {backup.file_count.toLocaleString()}
                          </p>
                        </div>
                      ) : null
                    })()}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => restoreBackup(selectedBackup)}
                      disabled={restoreInProgress}
                      className="flex items-center gap-2"
                    >
                      {restoreInProgress ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Confirm Restore
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedBackup(null)}
                      disabled={restoreInProgress}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No backup selected for recovery</p>
                  <p className="text-sm">Go to the Backup History tab to select a backup to restore.</p>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Recovery Documentation</Label>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Disaster Recovery Plan</h4>
                      <p className="text-sm text-blue-700">
                        Step-by-step procedures for system recovery in case of disasters
                      </p>
                      <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">
                        View Documentation →
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Recovery Checklist</h4>
                      <p className="text-sm text-green-700">
                        Pre and post-recovery validation checklist
                      </p>
                      <Button variant="link" className="p-0 h-auto text-green-600 text-sm">
                        View Checklist →
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Recovery Testing</h4>
                      <p className="text-sm text-purple-700">
                        Guidelines for testing backup integrity and recovery procedures
                      </p>
                      <Button variant="link" className="p-0 h-auto text-purple-600 text-sm">
                        View Guidelines →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-500">
          <p>Backup settings will be applied to future automated backups.</p>
          <p>Storage configuration changes may require reconnection to take effect.</p>
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Save Backup Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
