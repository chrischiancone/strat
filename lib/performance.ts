/**
 * Performance monitoring and optimization utilities
 */

import { logger } from './logger'

// Web Vitals tracking
export interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// Performance timing for custom metrics
export class PerformanceTimer {
  private startTime: number
  private endTime?: number
  private name: string

  constructor(name: string) {
    this.name = name
    this.startTime = performance.now()
  }

  end(): number {
    this.endTime = performance.now()
    const duration = this.endTime - this.startTime
    
    logger.info(`Performance: ${this.name}`, {
      duration: Math.round(duration * 100) / 100,
      startTime: this.startTime,
      endTime: this.endTime
    })
    
    return duration
  }

  static measure<T>(name: string, fn: () => T): T {
    const timer = new PerformanceTimer(name)
    try {
      const result = fn()
      timer.end()
      return result
    } catch (error) {
      timer.end()
      throw error
    }
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const timer = new PerformanceTimer(name)
    try {
      const result = await fn()
      timer.end()
      return result
    } catch (error) {
      timer.end()
      throw error
    }
  }
}

// Database query performance tracking
export function trackDatabaseQuery<T>(
  operation: string,
  query: () => Promise<T>
): Promise<T> {
  return PerformanceTimer.measureAsync(`DB: ${operation}`, query)
}

// Component rendering performance
export function trackComponentRender(componentName: string) {
  return new PerformanceTimer(`Component: ${componentName}`)
}

// Image optimization utilities
export function getOptimizedImageProps(
  src: string,
  width: number,
  height: number,
  quality = 75
) {
  // Generate responsive image sizes
  const sizes = [
    { width: Math.round(width * 0.5), suffix: '@0.5x' },
    { width: width, suffix: '@1x' },
    { width: Math.round(width * 1.5), suffix: '@1.5x' },
    { width: Math.round(width * 2), suffix: '@2x' },
  ]

  const srcSet = sizes
    .map(size => `${src}?w=${size.width}&q=${quality} ${size.width}w`)
    .join(', ')

  return {
    src: `${src}?w=${width}&q=${quality}`,
    srcSet,
    sizes: `(max-width: ${Math.round(width * 0.5)}px) 50vw, (max-width: ${width}px) 100vw, ${width}px`,
    width,
    height,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    }
  }
  return null
}

// Performance monitoring for React components
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const timer = trackComponentRender(componentName)
    
    React.useEffect(() => {
      timer.end()
    })

    return React.createElement(WrappedComponent, props)
  }
}

// Bundle size analysis helpers
export function reportBundleSize() {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    // Report estimated bundle size using resource timing
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && 
      !resource.name.includes('node_modules')
    )
    
    const totalSize = jsResources.reduce((sum, resource) => {
      return sum + (resource.transferSize || 0)
    }, 0)
    
    logger.info('Bundle Analysis', {
      totalJSSize: Math.round(totalSize / 1024), // KB
      numberOfJSFiles: jsResources.length,
      resources: jsResources.map(r => ({
        name: r.name.split('/').pop(),
        size: Math.round((r.transferSize || 0) / 1024) // KB
      }))
    })
  }
}

// Cache performance utilities
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static set<T>(key: string, data: T, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    })
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key)
    
    if (!cached) {
      return null
    }

    const isExpired = Date.now() - cached.timestamp > cached.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  static clear(): void {
    this.cache.clear()
  }

  static size(): number {
    return this.cache.size
  }
}

// Performance report generation
export function generatePerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    memory: getMemoryUsage(),
    cacheSize: CacheManager.size(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    connection: typeof window !== 'undefined' && 'connection' in navigator 
      ? {
          effectiveType: (navigator as any).connection?.effectiveType,
          downlink: (navigator as any).connection?.downlink,
          rtt: (navigator as any).connection?.rtt,
        }
      : null,
  }

  logger.info('Performance Report', report)
  return report
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        reportBundleSize()
        generatePerformanceReport()
      }, 1000)
    })

    // Monitor navigation performance
    if ('navigation' in performance) {
      const navigation = (performance as any).navigation
      logger.info('Navigation Performance', {
        type: navigation.type,
        redirectCount: navigation.redirectCount,
      })
    }
  }
}