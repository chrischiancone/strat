import { logger } from '@/lib/logger'
import { getPerformanceSettings } from './settings'

/**
 * Apply monitoring settings to the logger
 * This updates the logger's configuration based on database settings
 */
export async function applyMonitoringSettings(): Promise<void> {
  try {
    const settings = await getPerformanceSettings()
    
    if (!settings.monitoring.enabled) {
      // If monitoring is disabled, set to error-only logging
      logger.setLogLevel('error')
      logger.setErrorTracking(false)
      return
    }

    // Apply log level from settings
    logger.setLogLevel(settings.monitoring.log_level)
    
    // Apply error tracking preference
    logger.setErrorTracking(settings.monitoring.enable_error_tracking)

    logger.info('Monitoring settings applied', {
      log_level: settings.monitoring.log_level,
      error_tracking: settings.monitoring.enable_error_tracking,
      analytics: settings.monitoring.enable_analytics,
    })
  } catch (error) {
    // If we can't load settings, keep defaults
    logger.warn('Failed to apply monitoring settings, using defaults', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Initialize performance optimizations
 * This should be called at application startup
 */
export async function initializePerformanceSettings(): Promise<void> {
  await applyMonitoringSettings()
  
  // Additional initialization can be added here
  // For example:
  // - Configure compression settings
  // - Set up CDN configurations
  // - Initialize caching layers
}
