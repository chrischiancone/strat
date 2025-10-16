import { createServerSupabaseClient } from '@/lib/supabase/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { createGzip } from 'zlib'

const pipelineAsync = promisify(pipeline)

export interface RetentionPolicy {
  id: string
  name: string
  description: string
  retentionPeriodDays: number
  archivePeriodDays: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
  applicableTableNames: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ArchivalJob {
  id: string
  policyId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime: string
  endTime?: string
  recordsProcessed: number
  recordsArchived: number
  recordsDeleted: number
  archiveLocation: string
  errorMessage?: string
}

export interface RetentionReport {
  totalRecords: number
  recordsToArchive: number
  recordsToDelete: number
  oldestRecord: string
  newestRecord: string
  diskSpaceUsed: number
  estimatedSpaceSaved: number
  retentionPolicies: RetentionPolicy[]
  lastArchivalDate?: string
}

export class AuditRetentionService {
  private supabase

  constructor() {
    this.supabase = createServerSupabaseClient()
  }

  /**
   * Create a new retention policy
   */
  async createRetentionPolicy(policy: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<RetentionPolicy> {
    const { data, error } = await this.supabase
      .from('audit_retention_policies')
      .insert({
        name: policy.name,
        description: policy.description,
        retention_period_days: policy.retentionPeriodDays,
        archive_period_days: policy.archivePeriodDays,
        compression_enabled: policy.compressionEnabled,
        encryption_enabled: policy.encryptionEnabled,
        applicable_table_names: policy.applicableTableNames,
        is_active: policy.isActive
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create retention policy: ${error.message}`)
    }

    return this.mapRetentionPolicy(data)
  }

  /**
   * Get all retention policies
   */
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    const { data, error } = await this.supabase
      .from('audit_retention_policies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch retention policies: ${error.message}`)
    }

    return data.map(this.mapRetentionPolicy)
  }

  /**
   * Update a retention policy
   */
  async updateRetentionPolicy(id: string, updates: Partial<RetentionPolicy>): Promise<RetentionPolicy> {
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.retentionPeriodDays !== undefined) updateData.retention_period_days = updates.retentionPeriodDays
    if (updates.archivePeriodDays !== undefined) updateData.archive_period_days = updates.archivePeriodDays
    if (updates.compressionEnabled !== undefined) updateData.compression_enabled = updates.compressionEnabled
    if (updates.encryptionEnabled !== undefined) updateData.encryption_enabled = updates.encryptionEnabled
    if (updates.applicableTableNames !== undefined) updateData.applicable_table_names = updates.applicableTableNames
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await this.supabase
      .from('audit_retention_policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update retention policy: ${error.message}`)
    }

    return this.mapRetentionPolicy(data)
  }

  /**
   * Generate retention report
   */
  async generateRetentionReport(): Promise<RetentionReport> {
    const [totalRecordsResult, oldestRecordResult, newestRecordResult, policiesResult] = await Promise.all([
      this.supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      this.supabase.from('audit_logs').select('changed_at').order('changed_at', { ascending: true }).limit(1),
      this.supabase.from('audit_logs').select('changed_at').order('changed_at', { ascending: false }).limit(1),
      this.getRetentionPolicies()
    ])

    const totalRecords = totalRecordsResult.count || 0
    const oldestRecord = oldestRecordResult.data?.[0]?.changed_at || new Date().toISOString()
    const newestRecord = newestRecordResult.data?.[0]?.changed_at || new Date().toISOString()

    // Calculate records to archive and delete based on policies
    let recordsToArchive = 0
    let recordsToDelete = 0

    for (const policy of policiesResult.filter(p => p.isActive)) {
      const archiveDate = new Date()
      archiveDate.setDate(archiveDate.getDate() - policy.archivePeriodDays)
      
      const deleteDate = new Date()
      deleteDate.setDate(deleteDate.getDate() - policy.retentionPeriodDays)

      for (const tableName of policy.applicableTableNames) {
        const { count: archiveCount } = await this.supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('table_name', tableName)
          .lt('changed_at', archiveDate.toISOString())

        const { count: deleteCount } = await this.supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('table_name', tableName)
          .lt('changed_at', deleteDate.toISOString())

        recordsToArchive += archiveCount || 0
        recordsToDelete += deleteCount || 0
      }
    }

    // Get last archival job
    const { data: lastArchivalData } = await this.supabase
      .from('audit_archival_jobs')
      .select('end_time')
      .eq('status', 'completed')
      .order('end_time', { ascending: false })
      .limit(1)

    const lastArchivalDate = lastArchivalData?.[0]?.end_time

    return {
      totalRecords,
      recordsToArchive,
      recordsToDelete,
      oldestRecord,
      newestRecord,
      diskSpaceUsed: totalRecords * 1024, // Rough estimate
      estimatedSpaceSaved: recordsToDelete * 1024, // Rough estimate
      retentionPolicies: policiesResult,
      lastArchivalDate
    }
  }

  /**
   * Execute archival process for a policy
   */
  async executeArchival(policyId: string, archiveLocation: string): Promise<ArchivalJob> {
    // Create archival job record
    const { data: jobData, error: jobError } = await this.supabase
      .from('audit_archival_jobs')
      .insert({
        policy_id: policyId,
        status: 'running',
        start_time: new Date().toISOString(),
        records_processed: 0,
        records_archived: 0,
        records_deleted: 0,
        archive_location: archiveLocation
      })
      .select()
      .single()

    if (jobError) {
      throw new Error(`Failed to create archival job: ${jobError.message}`)
    }

    const job = this.mapArchivalJob(jobData)

    try {
      // Get the policy
      const { data: policyData, error: policyError } = await this.supabase
        .from('audit_retention_policies')
        .select('*')
        .eq('id', policyId)
        .single()

      if (policyError) {
        throw new Error(`Failed to fetch retention policy: ${policyError.message}`)
      }

      const policy = this.mapRetentionPolicy(policyData)
      const archiveDate = new Date()
      archiveDate.setDate(archiveDate.getDate() - policy.archivePeriodDays)

      const deleteDate = new Date()
      deleteDate.setDate(deleteDate.getDate() - policy.retentionPeriodDays)

      let totalProcessed = 0
      let totalArchived = 0
      let totalDeleted = 0

      for (const tableName of policy.applicableTableNames) {
        // Get records to archive
        const { data: recordsToArchive, error: fetchError } = await this.supabase
          .from('audit_logs')
          .select('*')
          .eq('table_name', tableName)
          .gte('changed_at', deleteDate.toISOString())
          .lt('changed_at', archiveDate.toISOString())

        if (fetchError) {
          throw new Error(`Failed to fetch records to archive: ${fetchError.message}`)
        }

        if (recordsToArchive && recordsToArchive.length > 0) {
          // Archive records to file
          const fileName = `audit_archive_${tableName}_${new Date().toISOString().split('T')[0]}.json`
          const filePath = join(archiveLocation, fileName)
          
          // Ensure directory exists
          await mkdir(archiveLocation, { recursive: true })

          let data = JSON.stringify(recordsToArchive, null, 2)
          
          if (policy.compressionEnabled) {
            // Compress the data
            const compressedFilePath = `${filePath}.gz`
            const readableStream = require('stream').Readable.from([data])
            const writableStream = createWriteStream(compressedFilePath)
            const gzipStream = createGzip()
            
            await pipelineAsync(readableStream, gzipStream, writableStream)
          } else {
            await writeFile(filePath, data, 'utf8')
          }

          totalArchived += recordsToArchive.length
        }

        // Get records to delete (beyond retention period)
        const { data: recordsToDelete, error: deleteError } = await this.supabase
          .from('audit_logs')
          .select('id')
          .eq('table_name', tableName)
          .lt('changed_at', deleteDate.toISOString())

        if (deleteError) {
          throw new Error(`Failed to fetch records to delete: ${deleteError.message}`)
        }

        if (recordsToDelete && recordsToDelete.length > 0) {
          const recordIds = recordsToDelete.map(r => r.id)
          
          // Delete records in batches
          const batchSize = 1000
          for (let i = 0; i < recordIds.length; i += batchSize) {
            const batch = recordIds.slice(i, i + batchSize)
            const { error } = await this.supabase
              .from('audit_logs')
              .delete()
              .in('id', batch)

            if (error) {
              throw new Error(`Failed to delete records: ${error.message}`)
            }
          }

          totalDeleted += recordsToDelete.length
        }

        totalProcessed += (recordsToArchive?.length || 0) + (recordsToDelete?.length || 0)
      }

      // Update job as completed
      const { data: completedJob, error: updateError } = await this.supabase
        .from('audit_archival_jobs')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          records_processed: totalProcessed,
          records_archived: totalArchived,
          records_deleted: totalDeleted
        })
        .eq('id', job.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update job status: ${updateError.message}`)
      }

      return this.mapArchivalJob(completedJob)

    } catch (error) {
      // Update job as failed
      await this.supabase
        .from('audit_archival_jobs')
        .update({
          status: 'failed',
          end_time: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', job.id)

      throw error
    }
  }

  /**
   * Get archival job history
   */
  async getArchivalJobs(limit = 50): Promise<ArchivalJob[]> {
    const { data, error } = await this.supabase
      .from('audit_archival_jobs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch archival jobs: ${error.message}`)
    }

    return data.map(this.mapArchivalJob)
  }

  /**
   * Schedule automatic archival (would be called by cron job)
   */
  async scheduleArchival(archiveLocation: string): Promise<void> {
    const policies = await this.getRetentionPolicies()
    const activePolicies = policies.filter(p => p.isActive)

    for (const policy of activePolicies) {
      try {
        await this.executeArchival(policy.id, archiveLocation)
      } catch (error) {
        console.error(`Failed to execute archival for policy ${policy.name}:`, error)
      }
    }
  }

  /**
   * Restore archived data (for compliance or investigation)
   */
  async restoreArchivedData(archiveLocation: string, fileName: string): Promise<number> {
    try {
      const filePath = join(archiveLocation, fileName)
      let data: string

      if (fileName.endsWith('.gz')) {
        // Handle compressed files
        const fs = require('fs')
        const zlib = require('zlib')
        const buffer = fs.readFileSync(filePath)
        data = zlib.gunzipSync(buffer).toString('utf8')
      } else {
        const fs = require('fs')
        data = fs.readFileSync(filePath, 'utf8')
      }

      const records = JSON.parse(data)
      
      if (!Array.isArray(records)) {
        throw new Error('Invalid archive file format')
      }

      // Restore records to audit_logs table
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(records)

      if (error) {
        throw new Error(`Failed to restore records: ${error.message}`)
      }

      return records.length

    } catch (error) {
      throw new Error(`Failed to restore archived data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate: string, endDate: string): Promise<{
    auditTrail: any[]
    retentionCompliance: {
      policyName: string
      compliant: boolean
      issues: string[]
    }[]
    dataIntegrity: {
      totalRecords: number
      hashedRecords: number
      integrityViolations: number
    }
  }> {
    // Get audit trail for the period
    const { data: auditTrail, error: auditError } = await this.supabase
      .from('audit_logs')
      .select('*')
      .gte('changed_at', startDate)
      .lte('changed_at', endDate)
      .order('changed_at', { ascending: true })

    if (auditError) {
      throw new Error(`Failed to fetch audit trail: ${auditError.message}`)
    }

    // Check retention compliance
    const policies = await this.getRetentionPolicies()
    const retentionCompliance = []

    for (const policy of policies.filter(p => p.isActive)) {
      const compliance = {
        policyName: policy.name,
        compliant: true,
        issues: [] as string[]
      }

      const retentionDate = new Date()
      retentionDate.setDate(retentionDate.getDate() - policy.retentionPeriodDays)

      for (const tableName of policy.applicableTableNames) {
        const { count } = await this.supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('table_name', tableName)
          .lt('changed_at', retentionDate.toISOString())

        if (count && count > 0) {
          compliance.compliant = false
          compliance.issues.push(`${count} records in ${tableName} exceed retention period`)
        }
      }

      retentionCompliance.push(compliance)
    }

    // Data integrity check (simplified)
    const totalRecords = auditTrail?.length || 0
    const hashedRecords = 0 // Would implement hash verification here
    const integrityViolations = 0 // Would check for tampering here

    return {
      auditTrail: auditTrail || [],
      retentionCompliance,
      dataIntegrity: {
        totalRecords,
        hashedRecords,
        integrityViolations
      }
    }
  }

  /**
   * Map database record to RetentionPolicy interface
   */
  private mapRetentionPolicy(data: any): RetentionPolicy {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      retentionPeriodDays: data.retention_period_days,
      archivePeriodDays: data.archive_period_days,
      compressionEnabled: data.compression_enabled,
      encryptionEnabled: data.encryption_enabled,
      applicableTableNames: data.applicable_table_names,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Map database record to ArchivalJob interface
   */
  private mapArchivalJob(data: any): ArchivalJob {
    return {
      id: data.id,
      policyId: data.policy_id,
      status: data.status,
      startTime: data.start_time,
      endTime: data.end_time,
      recordsProcessed: data.records_processed,
      recordsArchived: data.records_archived,
      recordsDeleted: data.records_deleted,
      archiveLocation: data.archive_location,
      errorMessage: data.error_message
    }
  }
}

export default AuditRetentionService