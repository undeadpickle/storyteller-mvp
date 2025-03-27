import { logger } from './debug';

// Use Vite's import.meta.env for environment detection
const IS_DEV = import.meta.env.DEV;

/**
 * Utility for tracking performance measurements
 */
export const performanceMonitor = {
  /**
   * Start timing a performance measurement
   * @param label A unique label for this measurement
   */
  start: (label: string) => {
    // Check IS_DEV (derived from import.meta.env.DEV)
    if (IS_DEV && typeof window !== 'undefined') {
      window.performance.mark(`${label}-start`);
    }
  },

  /**
   * End timing and log the performance measurement
   * @param label The same label used in start()
   * @param threshold Optional threshold in ms to only log if exceeded
   */
  end: (label: string, threshold = 0) => {
    // Check IS_DEV
    if (IS_DEV && typeof window !== 'undefined') {
      try {
        window.performance.mark(`${label}-end`);
        window.performance.measure(label, `${label}-start`, `${label}-end`);

        const measurements = window.performance.getEntriesByName(label, 'measure');
        if (measurements.length > 0) {
          const duration = measurements[0].duration;

          // Only log if duration exceeds threshold
          if (duration > threshold) {
            logger.info(`Performance: ${label}`, {
              duration: `${duration.toFixed(2)}ms`,
              threshold: threshold ? `${threshold}ms` : 'none',
            });
          }

          // Clean up measurements to avoid memory leaks
          window.performance.clearMarks(`${label}-start`);
          window.performance.clearMarks(`${label}-end`);
          window.performance.clearMeasures(label);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Silently ignore errors in performance measurement
        // to avoid breaking the app
      }
    }
  },

  /**
   * Wrap a function with performance tracking
   * @param fn Function to wrap
   * @param label Label for the measurement
   * @param threshold Optional threshold in ms
   */
  // Changed 'any[]' to 'unknown[]' and '=> any' to '=> unknown'
  track: <T extends (...args: unknown[]) => unknown>(fn: T, label: string, threshold = 0): T => {
    // Check IS_DEV
    if (IS_DEV) {
      // We need to correctly type the parameters here now
      return ((...args: Parameters<T>) => {
        performanceMonitor.start(label);
        const result = fn(...args);

        // Handle promises
        if (result instanceof Promise) {
          return result.finally(() => {
            performanceMonitor.end(label, threshold);
          });
        }

        performanceMonitor.end(label, threshold);
        return result;
      }) as T;
    }
    return fn;
  },
};
