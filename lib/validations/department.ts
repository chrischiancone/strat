import { z } from 'zod'

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    }),
  directorName: z
    .string()
    .max(100, 'Director name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  directorEmail: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  missionStatement: z
    .string()
    .max(500, 'Mission statement must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
})

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
