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
