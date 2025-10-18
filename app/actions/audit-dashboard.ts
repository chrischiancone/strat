'use server'

import AuditLogService from '@/lib/services/audit-logs'

export async function getAuditDashboardStats() {
  const auditService = new AuditLogService()
  return await auditService.getDashboardStats()
}

export async function getUserActivitySummary(limit: number = 10) {
  const auditService = new AuditLogService()
  return await auditService.getUserActivitySummary(limit)
}

export async function detectSecurityEvents(hoursBack: number = 24) {
  const auditService = new AuditLogService()
  return await auditService.detectSecurityEvents(hoursBack)
}
