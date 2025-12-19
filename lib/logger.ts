import pino from 'pino';

/**
 * Structured logger using Pino
 * Replaces console.log/error with proper log levels and structured data
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Create logger instance with appropriate configuration
// Note: Disabled pino-pretty transport to avoid worker thread issues in Next.js
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Simple formatting for all environments to avoid worker thread issues
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,

  // Base fields included in all logs
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'clinic-queue-system',
  },
});

/**
 * API Logger - specific logger for API routes
 */
export const apiLogger = logger.child({ context: 'api' });

/**
 * Database Logger - specific logger for database operations
 */
export const dbLogger = logger.child({ context: 'database' });

/**
 * Auth Logger - specific logger for authentication
 */
export const authLogger = logger.child({ context: 'auth' });

/**
 * Helper to log HTTP requests
 */
export function logRequest(
  method: string,
  path: string,
  metadata?: Record<string, any>
) {
  apiLogger.info(
    {
      method,
      path,
      ...metadata,
    },
    `${method} ${path}`
  );
}

/**
 * Helper to log HTTP responses
 */
export function logResponse(
  method: string,
  path: string,
  statusCode: number,
  duration?: number,
  metadata?: Record<string, any>
) {
  const logMethod = statusCode >= 400 ? 'error' : 'info';

  apiLogger[logMethod](
    {
      method,
      path,
      statusCode,
      duration,
      ...metadata,
    },
    `${method} ${path} - ${statusCode}${duration ? ` (${duration}ms)` : ''}`
  );
}

/**
 * Helper to log errors with context
 */
export function logError(
  error: Error | unknown,
  context: string,
  metadata?: Record<string, any>
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  logger.error(
    {
      context,
      error: {
        message: errorObj.message,
        stack: errorObj.stack,
        name: errorObj.name,
      },
      ...metadata,
    },
    `Error in ${context}: ${errorObj.message}`
  );
}

/**
 * Helper to log database operations
 */
export function logDbOperation(
  operation: string,
  model: string,
  metadata?: Record<string, any>
) {
  dbLogger.debug(
    {
      operation,
      model,
      ...metadata,
    },
    `DB ${operation} on ${model}`
  );
}

/**
 * Helper to log authentication events
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'register' | 'failed_login',
  userId?: string,
  metadata?: Record<string, any>
) {
  authLogger.info(
    {
      event,
      userId,
      ...metadata,
    },
    `Auth event: ${event}${userId ? ` for user ${userId}` : ''}`
  );
}

/**
 * Helper to log security events
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  metadata?: Record<string, any>
) {
  logger.warn(
    {
      security: true,
      event,
      severity,
      ...metadata,
    },
    `Security event: ${event}`
  );
}

export default logger;
