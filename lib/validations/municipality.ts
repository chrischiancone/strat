import { z } from 'zod'

export const updateMunicipalitySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  state: z
    .string()
    .max(50, 'State must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  contactName: z
    .string()
    .max(100, 'Contact name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  contactEmail: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal('')),
  timezone: z
    .string()
    .optional(),
  currency: z
    .string()
    .optional(),
  fiscalYearStartMonth: z
    .number()
    .min(1)
    .max(12)
    .optional(),
  aiAssistance: z
    .boolean()
    .optional(),
  publicDashboard: z
    .boolean()
    .optional(),
  multiDepartmentCollaboration: z
    .boolean()
    .optional(),
})

export type UpdateMunicipalityInput = z.infer<typeof updateMunicipalitySchema>
