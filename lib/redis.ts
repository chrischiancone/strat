/**
 * Redis Client Utility
 * 
 * Provides a singleton Redis client for caching across the application
 */

import Redis from 'ioredis'
import { logger } from './logger'

let redisClient: Redis | null = null

/**
 * Get Redis client instance (singleton)
 */
export function getRedisClient(): Redis | null {
  // Skip Redis in development if not configured
  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'development') {
    return null
  }

  if (!redisClient) {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
      
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        reconnectOnError(err) {
          const targetError = 'READONLY'
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true
          }
          return false
        },
      })

      redisClient.on('error', (error) => {
        logger.error('Redis client error:', { error })
      })

      redisClient.on('connect', () => {
        logger.info('Redis client connected')
      })

      redisClient.on('ready', () => {
        logger.info('Redis client ready')
      })

      redisClient.on('close', () => {
        logger.warn('Redis client connection closed')
      })

    } catch (error) {
      logger.error('Failed to create Redis client:', { error })
      return null
    }
  }

  return redisClient
}

/**
 * Redis cache utilities
 */
export const RedisCache = {
  /**
   * Set a value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      const serialized = JSON.stringify(value)
      await client.setex(key, ttlSeconds, serialized)
      return true
    } catch (error) {
      logger.error('Redis set error:', { error, key })
      return false
    }
  },

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient()
    if (!client) return null

    try {
      const data = await client.get(key)
      if (!data) return null
      return JSON.parse(data) as T
    } catch (error) {
      logger.error('Redis get error:', { error, key })
      return null
    }
  },

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      await client.del(key)
      return true
    } catch (error) {
      logger.error('Redis del error:', { error, key })
      return false
    }
  },

  /**
   * Clear all cache (DANGEROUS - use with caution)
   */
  async flushAll(): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      await client.flushall()
      logger.info('Redis cache cleared')
      return true
    } catch (error) {
      logger.error('Redis flushall error:', { error })
      return false
    }
  },

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean
    totalKeys: number
    usedMemory: string
    hitRate?: number
  } | null> {
    const client = getRedisClient()
    if (!client) {
      return {
        connected: false,
        totalKeys: 0,
        usedMemory: '0',
      }
    }

    try {
      const info = await client.info('stats')
      const keyspace = await client.info('keyspace')
      const memory = await client.info('memory')

      // Parse keyspace info to get total keys
      const db0Match = keyspace.match(/db0:keys=(\d+)/)
      const totalKeys = db0Match ? parseInt(db0Match[1]) : 0

      // Parse stats for hit rate
      const hitsMatch = info.match(/keyspace_hits:(\d+)/)
      const missesMatch = info.match(/keyspace_misses:(\d+)/)
      const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0
      const misses = missesMatch ? parseInt(missesMatch[1]) : 0
      const total = hits + misses
      const hitRate = total > 0 ? (hits / total) * 100 : 0

      // Parse memory usage
      const memoryMatch = memory.match(/used_memory_human:([^\r\n]+)/)
      const usedMemory = memoryMatch ? memoryMatch[1].trim() : '0'

      return {
        connected: true,
        totalKeys,
        usedMemory,
        hitRate: parseFloat(hitRate.toFixed(3)),
      }
    } catch (error) {
      logger.error('Redis stats error:', { error })
      return null
    }
  },

  /**
   * Test Redis connection
   */
  async ping(): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      const result = await client.ping()
      return result === 'PONG'
    } catch (error) {
      logger.error('Redis ping error:', { error })
      return false
    }
  },
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.info('Redis connection closed')
  }
}
