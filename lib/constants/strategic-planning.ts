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

export const FUNDING_STATUSES = [
  { value: 'secured', label: 'Secured', description: 'Funding confirmed and available' },
  { value: 'requested', label: 'Requested', description: 'Application submitted, awaiting approval' },
  { value: 'pending', label: 'Pending', description: 'Under review or in pipeline' },
  { value: 'projected', label: 'Projected', description: 'Expected but not yet formally requested' },
] as const

export const BUDGET_CATEGORIES = [
  { key: 'personnel', label: 'Personnel' },
  { key: 'equipment', label: 'Equipment & Technology' },
  { key: 'services', label: 'Professional Services' },
  { key: 'training', label: 'Training & Development' },
  { key: 'materials', label: 'Materials & Supplies' },
  { key: 'other', label: 'Other' },
] as const
