/**
 * Query result caching utility using Redis
 * 
 * Provides automatic caching for database queries to improve performance
 */

import { RedisCache } from '../redis'
import { logger } from '../logger'

export interface CacheOptions {
  /** Time to live in seconds (default: 3600 = 1 hour) */
  ttl?: number
  /** Cache key prefix (default: 'query:') */
  prefix?: string
  /** Whether to enable caching (default: true) */
  enabled?: boolean
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  ttl: 3600,
  prefix: 'query:',
  enabled: true,
}

/**
 * Generate cache key from query parameters
 */
function generateCacheKey(
  table: string,
  filters: Record<string, unknown>,
  prefix: string
): string {
  const filterString = JSON.stringify(filters, Object.keys(filters).sort())
  const hash = Buffer.from(filterString).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
  return `${prefix}${table}:${hash.substring(0, 32)}`
}

/**
 * Cache a database query result
 * 
 * @example
 * ```ts
 * const cached = await cacheQuery(
 *   'initiatives',
 *   { department_id: '123', status: 'active' },
 *   async () => {
 *     return await supabase.from('initiatives').select('*').eq('department_id', '123')
 *   },
 *   { ttl: 1800 } // Cache for 30 minutes
 * )
 * ```
 */
export async function cacheQuery<T>(
  table: string,
  filters: Record<string, unknown>,
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Skip caching if disabled
  if (!opts.enabled) {
    return queryFn()
  }

  const cacheKey = generateCacheKey(table, filters, opts.prefix)
  
  // Try to get from cache
  const cached = await RedisCache.get<T>(cacheKey)
  if (cached !== null) {
    logger.debug('Cache hit', { table, cacheKey })
    return cached
  }

  // Cache miss - execute query
  logger.debug('Cache miss', { table, cacheKey })
  const result = await queryFn()
  
  // Store in cache
  await RedisCache.set(cacheKey, result, opts.ttl)
  
  return result
}

/**
 * Invalidate cache for a specific table
 */
export async function invalidateTableCache(table: string, prefix: string = 'query:'): Promise<void> {
  // Note: Redis doesn't support pattern deletion directly
  // In production, consider using Redis SCAN or maintaining a key index
  logger.info('Cache invalidation requested', { table })
  
  // For now, we'll need to track keys or use a different strategy
  // This is a placeholder - implement based on your Redis setup
}

/**
 * Clear all query caches
 */
export async function clearQueryCache(): Promise<void> {
  await RedisCache.flushAll()
  logger.info('All query caches cleared')
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  return await RedisCache.getStats()
}

