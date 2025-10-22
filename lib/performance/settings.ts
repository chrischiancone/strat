import { createClient } from '@supabase/supabase-js'

export interface PerformanceSettings {
  caching: {
    enabled: boolean
    redis_url: string
    cache_ttl: number
    enable_query_cache: boolean
    enable_page_cache: boolean
    enable_api_cache: boolean
  }
  database: {
    enable_query_optimization: boolean
    connection_pool_size: number
    query_timeout: number
    enable_slow_query_log: boolean
    auto_vacuum: boolean
  }
  monitoring: {
    enabled: boolean
    log_level: 'error' | 'warn' | 'info' | 'debug'
    enable_analytics: boolean
    enable_error_tracking: boolean
    performance_alerts: boolean
    retention_days: number
  }
  optimization: {
    enable_compression: boolean
    enable_minification: boolean
    enable_lazy_loading: boolean
    max_concurrent_requests: number
    enable_cdn: boolean
    cdn_url: string
  }
}

const DEFAULT_SETTINGS: PerformanceSettings = {
  caching: {
    enabled: true,
    redis_url: 'redis://localhost:6379',
    cache_ttl: 3600,
    enable_query_cache: true,
    enable_page_cache: true,
    enable_api_cache: true,
  },
  database: {
    enable_query_optimization: true,
    connection_pool_size: 20,
    query_timeout: 30000,
    enable_slow_query_log: true,
    auto_vacuum: true,
  },
  monitoring: {
    enabled: true,
    log_level: 'info',
    enable_analytics: true,
    enable_error_tracking: true,
    performance_alerts: true,
    retention_days: 30,
  },
  optimization: {
    enable_compression: true,
    enable_minification: true,
    enable_lazy_loading: true,
    max_concurrent_requests: 100,
    enable_cdn: false,
    cdn_url: '',
  },
}

// Cache performance settings to avoid database hit on every request
let cachedSettings: PerformanceSettings | null = null
let cacheExpiry: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get performance settings for use in middleware
 * Settings are cached for 5 minutes to reduce database queries
 */
export async function getPerformanceSettings(): Promise<PerformanceSettings> {
  const now = Date.now()
  
  // Return cached settings if still valid
  if (cachedSettings && now < cacheExpiry) {
    return cachedSettings
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
      .from('municipalities')
      .select('settings')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle<{ settings: any }>()

    const performanceSettings = data?.settings?.performance || {}
    
    // Deep merge with defaults
    cachedSettings = {
      caching: { ...DEFAULT_SETTINGS.caching, ...performanceSettings.caching },
      database: { ...DEFAULT_SETTINGS.database, ...performanceSettings.database },
      monitoring: { ...DEFAULT_SETTINGS.monitoring, ...performanceSettings.monitoring },
      optimization: { ...DEFAULT_SETTINGS.optimization, ...performanceSettings.optimization },
    }
    
    cacheExpiry = now + CACHE_TTL
    return cachedSettings
  } catch (error) {
    console.warn('Failed to load performance settings, using defaults:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Invalidate the performance settings cache
 * Call this after updating performance settings
 */
export function invalidatePerformanceSettingsCache(): void {
  cachedSettings = null
  cacheExpiry = 0
}
