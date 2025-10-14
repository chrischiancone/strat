import { z } from 'zod'

export const securitySettingsSchema = z.object({
  auth: z.object({
    minPasswordLength: z.number().int().min(6).max(128).default(8),
    passwordExpirationDays: z.number().int().min(0).max(3650).default(90),
    maxLoginAttempts: z.number().int().min(1).max(50).default(5),
    requireSpecialChars: z.boolean().default(true),
    requireTwoFactorAdmin: z.boolean().default(false),
    ssoEnabled: z.boolean().default(false),
  }).default({}),
  access: z.object({
    defaultUserRole: z.enum(['staff', 'department_director', 'city_manager', 'finance', 'admin']).default('staff'),
    autoApproveRegistration: z.boolean().default(false),
    ipWhitelistEnabled: z.boolean().default(false),
    allowedIPs: z.array(z.string()).default([]),
  }).default({}),
  audit: z.object({
    enableAuditLogging: z.boolean().default(true),
    failedLoginNotifications: z.boolean().default(true),
    dataExportLogging: z.boolean().default(true),
    retentionDays: z.number().int().min(1).max(3650).default(365),
  }).default({}),
  session: z.object({
    timeoutMinutes: z.number().int().min(5).max(1440).default(60),
    maxConcurrentSessions: z.number().int().min(1).max(50).default(3),
    rememberMeDays: z.number().int().min(1).max(365).default(30),
  }).default({})
}).default({})

export type SecuritySettings = z.infer<typeof securitySettingsSchema>