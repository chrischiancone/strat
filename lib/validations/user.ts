import { z } from 'zod'

const roleEnum = z.enum([
  'admin',
  'department_director',
  'staff',
  'city_manager',
  'finance',
  'council',
  'public',
], {
  required_error: 'Please select a role',
})

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: roleEnum,
  departmentId: z.string().optional(),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
}).refine(
  (data) => {
    // Department is required for staff and department_director roles
    if (data.role === 'staff' || data.role === 'department_director') {
      return !!data.departmentId
    }
    return true
  },
  {
    message: 'Department is required for this role',
    path: ['departmentId'],
  }
)

export const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: roleEnum,
  departmentId: z.string().optional(),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  isActive: z.boolean(),
}).refine(
  (data) => {
    // Department is required for staff and department_director roles
    if (data.role === 'staff' || data.role === 'department_director') {
      return !!data.departmentId
    }
    return true
  },
  {
    message: 'Department is required for this role',
    path: ['departmentId'],
  }
)

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
