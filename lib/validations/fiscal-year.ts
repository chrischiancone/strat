import { z } from 'zod'

const fiscalYearBaseSchema = z.object({
  year: z
    .number()
    .int('Year must be an integer')
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  isActive: z.boolean(),
}).refine(
  (data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end > start
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

export const createFiscalYearSchema = fiscalYearBaseSchema

export const updateFiscalYearSchema = fiscalYearBaseSchema

export type CreateFiscalYearInput = z.infer<typeof createFiscalYearSchema>
export type UpdateFiscalYearInput = z.infer<typeof updateFiscalYearSchema>
