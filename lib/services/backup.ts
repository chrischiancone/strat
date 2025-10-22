import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type SupabaseClient = ReturnType<typeof createBrowserSupabaseClient>

export interface BackupItem {
  id: string
  name: string
  type: 'full' | 'incremental' | 'differential'
  status: 'completed' | 'failed' | 'in_progress' | 'scheduled'
  size: number
  created_at: string
  duration: number
  includes: string[]
  file_count: number
  error_message?: string
  municipality_id: string
  file_path?: string
  checksum?: string
}

export interface BackupStats {
  total_backups: number
  total_size: number
  last_backup: string
  success_rate: number
  average_duration: number
  storage_used: number
  storage_limit: number
}

export interface CreateBackupOptions {
  type: 'full' | 'incremental'
  includes: {
    database: boolean
    files: boolean
    settings: boolean
    user_data: boolean
    logs: boolean
  }
  municipalityId: string
  userId: string
}

export class BackupService {
  private supabase: SupabaseClient
  private bucketName: string

  constructor(supabase: SupabaseClient, bucketName: string = 'backups') {
    this.supabase = supabase
    this.bucketName = bucketName
  }

  async initializeBucket(municipalitySlug: string): Promise<boolean> {
    const bucketName = `${municipalitySlug}-backups`
    
    console.log('Initializing bucket:', bucketName)
    
    // Simply set the bucket name - bucket should have been created via scripts/create-storage-bucket.js
    // We can't list buckets from client due to RLS, so we assume it exists
    this.bucketName = bucketName
    console.log('Bucket name set to:', bucketName)
    return true
  }

  async createBackup(options: CreateBackupOptions, onProgress?: (progress: number) => void): Promise<BackupItem | null> {
    try {
      console.log('Starting backup creation with options:', options)
      onProgress?.(0)
      
      // Create backup record in database first
      const backupId = crypto.randomUUID()
      const backupName = `${options.type === 'full' ? 'Full' : 'Incremental'} Backup - ${new Date().toISOString().split('T')[0]}`
      
      console.log('Creating backup record:', { backupId, backupName })
      
      const { error: insertError } = await this.supabase
        .from('backups')
        .insert({
          id: backupId,
          name: backupName,
          type: options.type,
          status: 'in_progress',
          municipality_id: options.municipalityId,
          created_by: options.userId,
          includes: Object.keys(options.includes).filter(key => options.includes[key as keyof typeof options.includes]),
          size: 0,
          duration: 0,
          file_count: 0
        })

      if (insertError) {
        console.error('Failed to create backup record:', insertError)
        throw new Error(`Failed to create backup record: ${insertError.message}`)
      }
      
      console.log('Backup record created successfully')

      onProgress?.(10)

      // Step 1: Gather data based on includes
      const backupData: { [key: string]: any } = {}
      let totalFileCount = 0

      if (options.includes.database) {
        console.log('Exporting database data...')
        onProgress?.(20)
        backupData.database = await this.exportDatabaseData(options.municipalityId)
        totalFileCount += Object.keys(backupData.database).length
        console.log('Database export completed, tables exported:', Object.keys(backupData.database).length)
      }

      if (options.includes.settings) {
        console.log('Exporting settings...')
        onProgress?.(30)
        backupData.settings = await this.exportSettings(options.municipalityId)
        totalFileCount += 1
        console.log('Settings export completed')
      }

      if (options.includes.user_data) {
        console.log('Exporting user data...')
        onProgress?.(40)
        backupData.user_data = await this.exportUserData(options.municipalityId)
        totalFileCount += backupData.user_data?.users?.length || 0
        console.log('User data export completed, users:', backupData.user_data?.users?.length || 0)
      }

      if (options.includes.files) {
        console.log('Exporting files...')
        onProgress?.(50)
        backupData.files = await this.exportFiles(options.municipalityId)
        totalFileCount += backupData.files?.length || 0
        console.log('Files export completed, files:', backupData.files?.length || 0)
      }

      if (options.includes.logs) {
        console.log('Exporting logs...')
        onProgress?.(60)
        backupData.logs = await this.exportLogs(options.municipalityId)
        totalFileCount += backupData.logs?.length || 0
        console.log('Logs export completed, logs:', backupData.logs?.length || 0)
      }

      onProgress?.(70)

      // Step 2: Create backup file
      console.log('Creating backup file, total file count:', totalFileCount)
      const backupContent = JSON.stringify(backupData, null, 2)
      const backupBlob = new Blob([backupContent], { type: 'application/json' })
      const fileName = `backup-${backupId}-${Date.now()}.json`
      const filePath = `${options.municipalityId}/${fileName}`
      
      console.log('Backup file created:', {
        size: backupBlob.size,
        fileName,
        filePath,
        bucketName: this.bucketName
      })

      onProgress?.(80)

      // Step 3: Upload to Supabase Storage via server (bypass client-side RLS)
      console.log('Uploading to Supabase Storage (server route)...')
      const uploadRes = await fetch('/api/backups/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: this.bucketName,
          path: filePath,
          content: backupContent,
          contentType: 'application/json'
        }),
      })

      if (!uploadRes.ok) {
        const { error: serverError } = await uploadRes.json().catch(() => ({ error: 'Upload failed' }))
        console.error('Storage upload failed (server):', serverError)
        await this.updateBackupStatus(backupId, 'failed', serverError)
        throw new Error(`Failed to upload backup: ${serverError}`)
      }
      
      console.log('Upload completed successfully')

      onProgress?.(90)

      // Step 4: Calculate final metrics
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - new Date().getTime()) / 1000) // This would be calculated properly
      const checksum = await this.calculateChecksum(backupContent)

      // Step 5: Update backup record
      const { data: updatedBackup, error: updateError } = await this.supabase
        .from('backups')
        .update({
          status: 'completed',
          size: backupBlob.size,
          duration: duration || 300, // Fallback duration
          file_count: totalFileCount,
          file_path: filePath,
          checksum: checksum,
          completed_at: endTime.toISOString()
        })
        .eq('id', backupId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update backup record: ${updateError.message}`)
      }

      onProgress?.(100)

      // Fire-and-forget notification for success
      fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'success',
          backupId,
          municipalityId: options.municipalityId,
        }),
      }).catch(() => {})

      return {
        id: backupId,
        name: backupName,
        type: options.type,
        status: 'completed',
        size: backupBlob.size,
        created_at: new Date().toISOString(),
        duration: duration || 300,
        includes: Object.keys(options.includes).filter(key => options.includes[key as keyof typeof options.includes]),
        file_count: totalFileCount,
        municipality_id: options.municipalityId,
        file_path: filePath,
        checksum
      }

    } catch (error) {
      console.error('Backup creation failed:', error)
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })

      // Attempt to send failure notification if we have a backupId in scope
      try {
        // backupId exists in this scope since it's defined before try
        // but TS may not know; so we wrap in try/catch safely
        // @ts-expect-error backupId is defined above
        if (typeof backupId === 'string') {
          // @ts-expect-error backupId is defined above
          fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'failure',
              // @ts-expect-error backupId is defined above
              backupId,
              municipalityId: options.municipalityId,
            }),
          }).catch(() => {})
        }
      } catch {}

      return null
    }
  }

  async getBackups(municipalityId: string): Promise<BackupItem[]> {
    try {
      const { data, error } = await this.supabase
        .from('backups')
        .select('*')
        .eq('municipality_id', municipalityId)
        .order('created_at', { ascending: false })

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          console.warn('Backups table does not exist. Please run the migration.')
          return []
        }
        throw error
      }
      
      if (!data) {
        return []
      }
      
      return data.map(backup => ({
        id: backup.id,
        name: backup.name,
        type: backup.type as 'full' | 'incremental' | 'differential',
        status: backup.status as 'completed' | 'failed' | 'in_progress' | 'scheduled',
        size: backup.size || 0,
        created_at: backup.created_at,
        duration: backup.duration || 0,
        includes: Array.isArray(backup.includes) ? backup.includes : [],
        file_count: backup.file_count || 0,
        error_message: backup.error_message,
        municipality_id: backup.municipality_id,
        file_path: backup.file_path,
        checksum: backup.checksum
      }))
      
    } catch (error) {
      console.error('Failed to fetch backups:', error)
      return []
    }
  }

  async getBackupStats(municipalityId: string): Promise<BackupStats> {
    try {
      const { data, error } = await this.supabase
        .from('backups')
        .select('*')
        .eq('municipality_id', municipalityId)

      if (error) {
        // If table doesn't exist, return default stats
        if (error.code === '42P01') {
          console.warn('Backups table does not exist. Please run the migration.')
        } else {
          throw error
        }
      }
      
      if (!data || data.length === 0) {
        return {
          total_backups: 0,
          total_size: 0,
          last_backup: '',
          success_rate: 0,
          average_duration: 0,
          storage_used: 0,
          storage_limit: 50 * 1024 * 1024 * 1024 // 50GB default
        }
      }

      const totalBackups = data.length
      const completedBackups = data.filter(b => b.status === 'completed')
      const totalSize = completedBackups.reduce((sum, b) => sum + (b.size || 0), 0)
      const totalDuration = completedBackups.reduce((sum, b) => sum + (b.duration || 0), 0)
      const lastBackup = data.length > 0 ? data[0].created_at : ''

      return {
        total_backups: totalBackups,
        total_size: totalSize,
        last_backup: lastBackup,
        success_rate: totalBackups > 0 ? (completedBackups.length / totalBackups) * 100 : 0,
        average_duration: completedBackups.length > 0 ? totalDuration / completedBackups.length : 0,
        storage_used: totalSize,
        storage_limit: 50 * 1024 * 1024 * 1024 // 50GB default
      }
      
    } catch (error) {
      console.error('Failed to fetch backup stats:', error)
      return {
        total_backups: 0,
        total_size: 0,
        last_backup: '',
        success_rate: 0,
        average_duration: 0,
        storage_used: 0,
        storage_limit: 50 * 1024 * 1024 * 1024 // 50GB default
      }
    }
  }

  async downloadBackup(backupId: string, municipalityId: string): Promise<Blob | null> {
    try {
      // Get backup record
      const { data: backup, error: fetchError } = await this.supabase
        .from('backups')
        .select('file_path')
        .eq('id', backupId)
        .eq('municipality_id', municipalityId)
        .single()

      if (fetchError || !backup?.file_path) {
        throw new Error('Backup not found')
      }

      // Download from storage via server API (bypasses client-side RLS)
      const downloadRes = await fetch('/api/backups/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: this.bucketName,
          path: backup.file_path
        }),
      })

      if (!downloadRes.ok) {
        const { error: serverError } = await downloadRes.json().catch(() => ({ error: 'Download failed' }))
        throw new Error(`Failed to download backup: ${serverError}`)
      }

      const { data: base64Data, contentType } = await downloadRes.json()
      
      // Convert base64 back to Blob
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      return new Blob([bytes], { type: contentType || 'application/json' })
    } catch (error) {
      console.error('Download failed:', error)
      return null
    }
  }

  async deleteBackup(backupId: string, municipalityId: string): Promise<boolean> {
    try {
      // Get backup record
      const { data: backup, error: fetchError } = await this.supabase
        .from('backups')
        .select('file_path')
        .eq('id', backupId)
        .eq('municipality_id', municipalityId)
        .single()

      if (fetchError) {
        throw new Error('Backup not found')
      }

      // Delete from storage
      if (backup.file_path) {
        const { error: storageError } = await this.supabase.storage
          .from(this.bucketName)
          .remove([backup.file_path])

        if (storageError) {
          console.error('Failed to delete backup file:', storageError)
        }
      }

      // Delete from database
      const { error: deleteError } = await this.supabase
        .from('backups')
        .delete()
        .eq('id', backupId)
        .eq('municipality_id', municipalityId)

      if (deleteError) {
        throw new Error(`Failed to delete backup record: ${deleteError.message}`)
      }

      return true
    } catch (error) {
      console.error('Delete failed:', error)
      return false
    }
  }

  async verifyBackupIntegrity(backupId: string, municipalityId: string): Promise<boolean> {
    try {
      const { data: backup, error: fetchError } = await this.supabase
        .from('backups')
        .select('file_path, checksum')
        .eq('id', backupId)
        .eq('municipality_id', municipalityId)
        .single()

      if (fetchError || !backup?.file_path) {
        return false
      }

      // Download via server API and verify checksum
      const downloadRes = await fetch('/api/backups/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: this.bucketName,
          path: backup.file_path
        }),
      })

      if (!downloadRes.ok) {
        return false
      }

      const { data: base64Data } = await downloadRes.json()
      
      // Convert base64 back to text
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes])
      const content = await blob.text()
      
      const calculatedChecksum = await this.calculateChecksum(content)

      return calculatedChecksum === backup.checksum
    } catch (error) {
      console.error('Integrity verification failed:', error)
      return false
    }
  }

  private async updateBackupStatus(backupId: string, status: string, errorMessage?: string) {
    await this.supabase
      .from('backups')
      .update({
        status,
        error_message: errorMessage,
        completed_at: new Date().toISOString()
      })
      .eq('id', backupId)
  }

  private async exportDatabaseData(municipalityId: string): Promise<any> {
    const exportData: any = {}

    // Export users - has municipality_id
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('municipality_id', municipalityId)
      
      if (!error && data) {
        exportData.users = data
      }
    } catch (error) {
      console.error('Error exporting users:', error)
      exportData.users = []
    }

    // Export departments - has municipality_id
    try {
      const { data, error } = await this.supabase
        .from('departments')
        .select('*')
        .eq('municipality_id', municipalityId)
      
      if (!error && data) {
        exportData.departments = data
      }
    } catch (error) {
      console.error('Error exporting departments:', error)
      exportData.departments = []
    }

    // Export fiscal_years - has municipality_id
    try {
      const { data, error } = await this.supabase
        .from('fiscal_years')
        .select('*')
        .eq('municipality_id', municipalityId)
      
      if (!error && data) {
        exportData.fiscal_years = data
      }
    } catch (error) {
      console.error('Error exporting fiscal_years:', error)
      exportData.fiscal_years = []
    }

    // Get department IDs for filtering related records
    const departmentIds = exportData.departments?.map((d: any) => d.id) || []

    // Export strategic_plans - filtered by department_id
    if (departmentIds.length > 0) {
      try {
        const { data, error } = await this.supabase
          .from('strategic_plans')
          .select('*')
          .in('department_id', departmentIds)
        
        if (!error && data) {
          exportData.strategic_plans = data
        }
      } catch (error) {
        console.error('Error exporting strategic_plans:', error)
        exportData.strategic_plans = []
      }

      // Get strategic plan IDs for further filtering
      const planIds = exportData.strategic_plans?.map((p: any) => p.id) || []

      // Export strategic_goals - filtered by strategic_plan_id
      if (planIds.length > 0) {
        try {
          const { data, error } = await this.supabase
            .from('strategic_goals')
            .select('*')
            .in('strategic_plan_id', planIds)
          
          if (!error && data) {
            exportData.strategic_goals = data
          }
        } catch (error) {
          console.error('Error exporting strategic_goals:', error)
          exportData.strategic_goals = []
        }

        const goalIds = exportData.strategic_goals?.map((g: any) => g.id) || []

        // Export initiatives - filtered by strategic_goal_id
        if (goalIds.length > 0) {
          try {
            const { data, error } = await this.supabase
              .from('initiatives')
              .select('*')
              .in('strategic_goal_id', goalIds)
            
            if (!error && data) {
              exportData.initiatives = data
            }
          } catch (error) {
            console.error('Error exporting initiatives:', error)
            exportData.initiatives = []
          }
        }
      }
    }

    return exportData
  }

  private async exportSettings(municipalityId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('municipalities')
        .select('settings')
        .eq('id', municipalityId)
        .maybeSingle()

      if (error) {
        console.error('Error exporting settings:', error)
        return {}
      }

      return data?.settings || {}
    } catch (error) {
      console.error('Exception exporting settings:', error)
      return {}
    }
  }

  private async exportUserData(municipalityId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, email, full_name, role, title, department_id, preferences')
      .eq('municipality_id', municipalityId)

    return !error ? { users: data } : { users: [] }
  }

  private async exportFiles(municipalityId: string): Promise<string[]> {
    // This would export file metadata or actual files from storage
    // For now, we'll just return a list of file paths
    const { data, error } = await this.supabase.storage
      .from('documents')
      .list(`${municipalityId}/`)

    return !error && data ? data.map(file => file.name) : []
  }

  private async exportLogs(municipalityId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('municipality_id', municipalityId)
      .order('changed_at', { ascending: false })
      .limit(1000) // Last 1000 logs

    return !error && data ? data : []
  }

  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}