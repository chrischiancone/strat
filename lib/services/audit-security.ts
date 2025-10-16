import { createServerSupabaseClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export interface AuditLogHash {
  id: string
  auditLogId: string
  hashValue: string
  hashAlgorithm: string
  previousHashValue?: string
  blockchainHash?: string
  timestamp: string
  verified: boolean
}

export interface SecurityEvent {
  id: string
  type: 'tamper_detected' | 'hash_mismatch' | 'unauthorized_access' | 'bulk_modification' | 'time_anomaly'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedRecords: string[]
  detectedAt: string
  userId?: string
  ipAddress?: string
  metadata: Record<string, unknown>
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
}

export interface IntegrityReport {
  totalRecords: number
  verifiedRecords: number
  tamperedRecords: number
  missingHashes: number
  securityEvents: SecurityEvent[]
  lastVerificationAt: string
  integrityScore: number // 0-100
}

export interface SignatureValidationResult {
  valid: boolean
  signedBy?: string
  signedAt?: string
  algorithm?: string
  errorMessage?: string
}

export class AuditSecurityService {
  private supabase
  private readonly HASH_ALGORITHM = 'sha256'
  private readonly SIGNATURE_ALGORITHM = 'RSA-SHA256'

  constructor() {
    this.supabase = createServerSupabaseClient()
  }

  /**
   * Generate hash for audit log record
   */
  generateRecordHash(auditLogData: any, previousHash?: string): string {
    const data = {
      ...auditLogData,
      previousHash: previousHash || null
    }
    
    // Normalize the data for consistent hashing
    const normalizedData = JSON.stringify(data, Object.keys(data).sort())
    return crypto.createHash(this.HASH_ALGORITHM).update(normalizedData).digest('hex')
  }

  /**
   * Create hash record for audit log entry
   */
  async createAuditLogHash(auditLogId: string): Promise<AuditLogHash> {
    // Get the audit log record
    const { data: auditLog, error: fetchError } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('id', auditLogId)
      .single()

    if (fetchError || !auditLog) {
      throw new Error(`Failed to fetch audit log: ${fetchError?.message || 'Record not found'}`)
    }

    // Get the previous hash value (for blockchain-like integrity)
    const { data: previousHashData } = await this.supabase
      .from('audit_log_hashes')
      .select('hash_value')
      .order('timestamp', { ascending: false })
      .limit(1)

    const previousHash = previousHashData?.[0]?.hash_value

    // Generate hash
    const hashValue = this.generateRecordHash(auditLog, previousHash)

    // Store hash record
    const { data, error } = await this.supabase
      .from('audit_log_hashes')
      .insert({
        audit_log_id: auditLogId,
        hash_value: hashValue,
        hash_algorithm: this.HASH_ALGORITHM,
        previous_hash_value: previousHash,
        timestamp: new Date().toISOString(),
        verified: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create audit log hash: ${error.message}`)
    }

    return this.mapAuditLogHash(data)
  }

  /**
   * Verify integrity of an audit log record
   */
  async verifyRecordIntegrity(auditLogId: string): Promise<{
    valid: boolean
    hashExists: boolean
    hashMatches: boolean
    chainValid: boolean
    errorMessage?: string
  }> {
    try {
      // Get the audit log record
      const { data: auditLog, error: auditError } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('id', auditLogId)
        .single()

      if (auditError || !auditLog) {
        return {
          valid: false,
          hashExists: false,
          hashMatches: false,
          chainValid: false,
          errorMessage: 'Audit log record not found'
        }
      }

      // Get the hash record
      const { data: hashRecord, error: hashError } = await this.supabase
        .from('audit_log_hashes')
        .select('*')
        .eq('audit_log_id', auditLogId)
        .single()

      if (hashError || !hashRecord) {
        return {
          valid: false,
          hashExists: false,
          hashMatches: false,
          chainValid: false,
          errorMessage: 'Hash record not found'
        }
      }

      // Verify hash matches current record
      const currentHash = this.generateRecordHash(auditLog, hashRecord.previous_hash_value)
      const hashMatches = currentHash === hashRecord.hash_value

      // Verify chain integrity (simplified)
      let chainValid = true
      if (hashRecord.previous_hash_value) {
        const { data: previousHashRecord } = await this.supabase
          .from('audit_log_hashes')
          .select('hash_value')
          .eq('hash_value', hashRecord.previous_hash_value)
          .single()

        chainValid = !!previousHashRecord
      }

      return {
        valid: hashMatches && chainValid,
        hashExists: true,
        hashMatches,
        chainValid,
        errorMessage: !hashMatches ? 'Hash mismatch detected - record may have been tampered with' :
                     !chainValid ? 'Chain integrity violation detected' : undefined
      }

    } catch (error) {
      return {
        valid: false,
        hashExists: false,
        hashMatches: false,
        chainValid: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error during verification'
      }
    }
  }

  /**
   * Perform bulk integrity verification
   */
  async verifyBulkIntegrity(limit = 1000): Promise<IntegrityReport> {
    const startTime = new Date().toISOString()
    
    try {
      // Get total audit log count
      const { count: totalRecords } = await this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })

      // Get audit logs with their hashes
      const { data: auditLogsWithHashes, error } = await this.supabase
        .from('audit_logs')
        .select(`
          id,
          table_name,
          record_id,
          action,
          old_values,
          new_values,
          changed_by,
          changed_at,
          audit_log_hashes!inner (
            hash_value,
            hash_algorithm,
            previous_hash_value,
            verified
          )
        `)
        .order('changed_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to fetch audit logs: ${error.message}`)
      }

      const records = auditLogsWithHashes || []
      let verifiedRecords = 0
      let tamperedRecords = 0
      const tamperedRecordIds: string[] = []

      // Verify each record
      for (const record of records) {
        const verification = await this.verifyRecordIntegrity(record.id)
        if (verification.valid) {
          verifiedRecords++
        } else {
          tamperedRecords++
          tamperedRecordIds.push(record.id)
        }
      }

      // Count records without hashes
      const { count: recordsWithHashes } = await this.supabase
        .from('audit_log_hashes')
        .select('*', { count: 'exact', head: true })

      const missingHashes = Math.max(0, (totalRecords || 0) - (recordsWithHashes || 0))

      // Get recent security events
      const { data: securityEvents } = await this.supabase
        .from('audit_security_events')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(100)

      const integrityScore = Math.round(
        (verifiedRecords / Math.max(1, verifiedRecords + tamperedRecords)) * 100
      )

      // Create security event if tampering detected
      if (tamperedRecords > 0) {
        await this.createSecurityEvent({
          type: 'tamper_detected',
          severity: tamperedRecords > 10 ? 'high' : 'medium',
          description: `Integrity verification found ${tamperedRecords} tampered records out of ${records.length} checked`,
          affectedRecords: tamperedRecordIds,
          metadata: {
            verificationBatch: limit,
            totalChecked: records.length,
            tamperedCount: tamperedRecords
          }
        })
      }

      return {
        totalRecords: totalRecords || 0,
        verifiedRecords,
        tamperedRecords,
        missingHashes,
        securityEvents: (securityEvents || []).map(this.mapSecurityEvent),
        lastVerificationAt: startTime,
        integrityScore
      }

    } catch (error) {
      throw new Error(`Failed to perform bulk integrity verification: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a security event
   */
  async createSecurityEvent(event: Omit<SecurityEvent, 'id' | 'detectedAt' | 'resolved'>): Promise<SecurityEvent> {
    const { data, error } = await this.supabase
      .from('audit_security_events')
      .insert({
        type: event.type,
        severity: event.severity,
        description: event.description,
        affected_records: event.affectedRecords,
        detected_at: new Date().toISOString(),
        user_id: event.userId,
        ip_address: event.ipAddress,
        metadata: event.metadata,
        resolved: false
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create security event: ${error.message}`)
    }

    return this.mapSecurityEvent(data)
  }

  /**
   * Resolve a security event
   */
  async resolveSecurityEvent(eventId: string, resolvedBy: string): Promise<SecurityEvent> {
    const { data, error } = await this.supabase
      .from('audit_security_events')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to resolve security event: ${error.message}`)
    }

    return this.mapSecurityEvent(data)
  }

  /**
   * Get security events
   */
  async getSecurityEvents(options: {
    unresolved?: boolean
    severity?: string
    type?: string
    limit?: number
  } = {}): Promise<SecurityEvent[]> {
    let query = this.supabase
      .from('audit_security_events')
      .select('*')

    if (options.unresolved) {
      query = query.eq('resolved', false)
    }

    if (options.severity) {
      query = query.eq('severity', options.severity)
    }

    if (options.type) {
      query = query.eq('type', options.type)
    }

    query = query
      .order('detected_at', { ascending: false })
      .limit(options.limit || 50)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch security events: ${error.message}`)
    }

    return (data || []).map(this.mapSecurityEvent)
  }

  /**
   * Digital signature generation (simplified - would use proper PKI in production)
   */
  generateDigitalSignature(data: any, privateKey: string): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort())
    return crypto.createSign(this.SIGNATURE_ALGORITHM)
      .update(dataString)
      .sign(privateKey, 'hex')
  }

  /**
   * Digital signature verification
   */
  verifyDigitalSignature(data: any, signature: string, publicKey: string): SignatureValidationResult {
    try {
      const dataString = JSON.stringify(data, Object.keys(data).sort())
      const isValid = crypto.createVerify(this.SIGNATURE_ALGORITHM)
        .update(dataString)
        .verify(publicKey, signature, 'hex')

      return {
        valid: isValid,
        algorithm: this.SIGNATURE_ALGORITHM,
        errorMessage: isValid ? undefined : 'Signature verification failed'
      }
    } catch (error) {
      return {
        valid: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown verification error'
      }
    }
  }

  /**
   * Detect anomalous patterns in audit logs
   */
  async detectAnomalies(): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = []
    const now = new Date()
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    try {
      // 1. Detect bulk modifications (many changes in short time)
      const { data: bulkChanges, error: bulkError } = await this.supabase
        .from('audit_logs')
        .select('changed_by, action, count(*)')
        .gte('changed_at', hourAgo.toISOString())
        .group('changed_by, action')

      if (!bulkError && bulkChanges) {
        for (const change of bulkChanges) {
          if (change.count > 50) { // Threshold for bulk operations
            const event = await this.createSecurityEvent({
              type: 'bulk_modification',
              severity: change.count > 100 ? 'high' : 'medium',
              description: `User performed ${change.count} ${change.action} operations in the last hour`,
              affectedRecords: [],
              userId: change.changed_by,
              metadata: {
                action: change.action,
                count: change.count,
                timeWindow: '1 hour'
              }
            })
            events.push(event)
          }
        }
      }

      // 2. Detect time anomalies (records with future timestamps)
      const futureThreshold = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes in future
      const { data: futureRecords, error: futureError } = await this.supabase
        .from('audit_logs')
        .select('id, changed_at')
        .gt('changed_at', futureThreshold.toISOString())

      if (!futureError && futureRecords && futureRecords.length > 0) {
        const event = await this.createSecurityEvent({
          type: 'time_anomaly',
          severity: 'medium',
          description: `Detected ${futureRecords.length} audit records with future timestamps`,
          affectedRecords: futureRecords.map(r => r.id),
          metadata: {
            count: futureRecords.length,
            futureRecords: futureRecords
          }
        })
        events.push(event)
      }

      // 3. Detect unauthorized access patterns (would be expanded based on business rules)
      const { data: suspiciousAccess, error: accessError } = await this.supabase
        .from('audit_logs')
        .select('changed_by, ip_address, count(*)')
        .gte('changed_at', hourAgo.toISOString())
        .group('changed_by, ip_address')

      if (!accessError && suspiciousAccess) {
        for (const access of suspiciousAccess) {
          if (access.count > 200) { // High activity threshold
            const event = await this.createSecurityEvent({
              type: 'unauthorized_access',
              severity: 'medium',
              description: `High activity detected: ${access.count} operations from IP ${access.ip_address}`,
              affectedRecords: [],
              userId: access.changed_by,
              ipAddress: access.ip_address,
              metadata: {
                activityCount: access.count,
                timeWindow: '1 hour'
              }
            })
            events.push(event)
          }
        }
      }

    } catch (error) {
      console.error('Error detecting anomalies:', error)
    }

    return events
  }

  /**
   * Generate audit trail hash chain for immutability
   */
  async generateHashChain(startDate?: string, endDate?: string): Promise<{
    chainHash: string
    recordCount: number
    startTimestamp: string
    endTimestamp: string
  }> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .order('changed_at', { ascending: true })

    if (startDate) {
      query = query.gte('changed_at', startDate)
    }

    if (endDate) {
      query = query.lte('changed_at', endDate)
    }

    const { data: records, error } = await query

    if (error) {
      throw new Error(`Failed to fetch audit records: ${error.message}`)
    }

    if (!records || records.length === 0) {
      throw new Error('No audit records found for the specified date range')
    }

    // Generate chain hash
    let chainHash = ''
    for (const record of records) {
      const recordHash = this.generateRecordHash(record, chainHash)
      chainHash = crypto.createHash(this.HASH_ALGORITHM)
        .update(chainHash + recordHash)
        .digest('hex')
    }

    return {
      chainHash,
      recordCount: records.length,
      startTimestamp: records[0].changed_at,
      endTimestamp: records[records.length - 1].changed_at
    }
  }

  /**
   * Map database record to AuditLogHash interface
   */
  private mapAuditLogHash(data: any): AuditLogHash {
    return {
      id: data.id,
      auditLogId: data.audit_log_id,
      hashValue: data.hash_value,
      hashAlgorithm: data.hash_algorithm,
      previousHashValue: data.previous_hash_value,
      blockchainHash: data.blockchain_hash,
      timestamp: data.timestamp,
      verified: data.verified
    }
  }

  /**
   * Map database record to SecurityEvent interface
   */
  private mapSecurityEvent(data: any): SecurityEvent {
    return {
      id: data.id,
      type: data.type,
      severity: data.severity,
      description: data.description,
      affectedRecords: data.affected_records || [],
      detectedAt: data.detected_at,
      userId: data.user_id,
      ipAddress: data.ip_address,
      metadata: data.metadata || {},
      resolved: data.resolved,
      resolvedAt: data.resolved_at,
      resolvedBy: data.resolved_by
    }
  }
}

export default AuditSecurityService