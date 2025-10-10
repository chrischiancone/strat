export const CITY_PRIORITIES = [
  'Economic Development',
  'Public Safety',
  'Infrastructure & Transportation',
  'Environmental Sustainability',
  'Community Health & Wellness',
  'Parks & Recreation',
  'Administrative Excellence',
  'Technology & Innovation',
] as const

export type CityPriority = (typeof CITY_PRIORITIES)[number]

export const PRIORITY_LEVELS = [
  { value: 'NEED', label: 'NEED', description: 'Critical - Must be funded' },
  { value: 'WANT', label: 'WANT', description: 'Important - Should be funded' },
  { value: 'NICE_TO_HAVE', label: 'NICE TO HAVE', description: 'Beneficial - Fund if resources permit' },
] as const

export const INITIATIVE_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'completed', label: 'Completed' },
  { value: 'deferred', label: 'Deferred' },
] as const
