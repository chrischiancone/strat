/**
 * Centralized logging system for the Strategic Planning application
 * Log levels can be dynamically configured via performance settings
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface LogContext {
  [key: string]: unknown
  userId?: string
  action?: string
  resource?: string
  planId?: string
  initiativeId?: string
  departmentId?: string
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: Date
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info'
  private errorTrackingEnabled: boolean = true

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  /**
   * Set the minimum log level dynamically
   * Call this to update the logger based on performance settings
   */
  setLogLevel(level: LogLevel): void {
    this.minLevel = level
  }

  /**
   * Enable or disable error tracking
   * When disabled, errors are still logged but may not be sent to external tracking services
   */
  setErrorTracking(enabled: boolean): void {
    this.errorTrackingEnabled = enabled
  }

  /**
   * Get the current log level
   */
  getLogLevel(): LogLevel {
    return this.minLevel
  }

  /**
   * Check if error tracking is enabled
   */
  isErrorTrackingEnabled(): boolean {
    return this.errorTrackingEnabled
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel]
  }

  private formatLogEntry(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return
    }

    const timestamp = entry.timestamp.toISOString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`

    if (this.isDevelopment) {
      // Development: Use console for better debugging
      const logFn = this.getConsoleMethod(entry.level)
      
      if (entry.context || entry.error) {
        logFn(prefix, entry.message, {
          ...(entry.context && { context: entry.context }),
          ...(entry.error && { error: entry.error }),
        })
      } else {
        logFn(prefix, entry.message)
      }
    } else {
      // Production: Structured JSON logging
      const logData = {
        timestamp,
        level: entry.level,
        message: entry.message,
        ...(entry.context && { context: entry.context }),
        ...(entry.error && { 
          error: {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack,
          }
        }),
      }
      
      console.log(JSON.stringify(logData))
    }
  }

  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case 'error':
        return console.error
      case 'warn':
        return console.warn
      case 'info':
        return console.info
      case 'debug':
        return console.debug
      default:
        return console.log
    }
  }

  debug(message: string, context?: LogContext): void {
    this.formatLogEntry({
      level: 'debug',
      message,
      context,
      timestamp: new Date(),
    })
  }

  info(message: string, context?: LogContext): void {
    this.formatLogEntry({
      level: 'info',
      message,
      context,
      timestamp: new Date(),
    })
  }

  warn(message: string, context?: LogContext): void {
    this.formatLogEntry({
      level: 'warn',
      message,
      context,
      timestamp: new Date(),
    })
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.formatLogEntry({
      level: 'error',
      message,
      context,
      error,
      timestamp: new Date(),
    })

    // If error tracking is enabled, this is where you'd send to external service
    // (e.g., Sentry, DataDog, etc.)
    if (this.errorTrackingEnabled && error) {
      // TODO: Integrate with error tracking service when configured
      // Example: Sentry.captureException(error, { contexts: { custom: context } })
    }
  }

  // Convenience method for database operations
  dbError(operation: string, error: Error, context?: LogContext): void {
    this.error(`Database error: ${operation}`, {
      ...context,
      operation,
    }, error)
  }

  // Convenience method for authentication operations
  authError(message: string, context?: LogContext, error?: Error): void {
    this.error(`Authentication error: ${message}`, {
      ...context,
      category: 'auth',
    }, error)
  }

  // Convenience method for API operations
  apiError(endpoint: string, error: Error, context?: LogContext): void {
    this.error(`API error: ${endpoint}`, {
      ...context,
      endpoint,
      category: 'api',
    }, error)
  }
}

// Export singleton instance
export const logger = new Logger()

// For backward compatibility during migration
export const log = logger