import { apiLogger } from './logger';

/**
 * Performance monitoring utilities
 */

/**
 * Measure execution time of async functions
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  label: string,
  metadata?: Record<string, any>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    apiLogger.info(
      {
        duration,
        label,
        ...metadata,
      },
      `${label} completed in ${duration}ms`
    );

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    apiLogger.error(
      {
        duration,
        label,
        error,
        ...metadata,
      },
      `${label} failed after ${duration}ms`
    );

    throw error;
  }
}

/**
 * Simple performance timer
 */
export class PerformanceTimer {
  private start: number;
  private label: string;
  private metadata: Record<string, any>;

  constructor(label: string, metadata?: Record<string, any>) {
    this.label = label;
    this.metadata = metadata || {};
    this.start = Date.now();
  }

  end() {
    const duration = Date.now() - this.start;

    apiLogger.debug(
      {
        duration,
        label: this.label,
        ...this.metadata,
      },
      `${this.label}: ${duration}ms`
    );

    return duration;
  }
}

/**
 * Track database query performance
 */
export function trackQuery<T>(
  queryFn: () => Promise<T>,
  queryName: string
): Promise<T> {
  return measureTime(queryFn, `DB Query: ${queryName}`, { type: 'database' });
}

/**
 * Track API request performance
 */
export function trackApiCall<T>(
  apiFn: () => Promise<T>,
  apiName: string
): Promise<T> {
  return measureTime(apiFn, `API Call: ${apiName}`, { type: 'api' });
}

/**
 * Get memory usage statistics
 */
export function getMemoryUsage() {
  const usage = process.memoryUsage();

  return {
    heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
    rssMB: Math.round(usage.rss / 1024 / 1024),
    externalMB: Math.round(usage.external / 1024 / 1024),
    arrayBuffersMB: Math.round(usage.arrayBuffers / 1024 / 1024),
  };
}

/**
 * Log performance metrics periodically
 */
export function startPerformanceMonitoring(intervalMs: number = 60000) {
  setInterval(() => {
    const memory = getMemoryUsage();
    const uptime = Math.floor(process.uptime());

    apiLogger.info(
      {
        memory,
        uptime,
        type: 'performance_metrics',
      },
      'Performance metrics'
    );
  }, intervalMs);
}

/**
 * Request timing middleware helper
 */
export function createRequestTimer() {
  const start = Date.now();

  return {
    end: () => Date.now() - start,
    log: (method: string, path: string, statusCode: number) => {
      const duration = Date.now() - start;

      apiLogger.info(
        {
          method,
          path,
          statusCode,
          duration,
          type: 'http_request',
        },
        `${method} ${path} - ${statusCode} (${duration}ms)`
      );

      return duration;
    },
  };
}

/**
 * Slow query detector
 */
export function warnIfSlow<T>(
  fn: () => Promise<T>,
  thresholdMs: number,
  operationName: string
): Promise<T> {
  return measureTime(fn, operationName).then((result) => {
    return result;
  });
}
