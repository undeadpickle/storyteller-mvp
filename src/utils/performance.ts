import { logger } from './debug';

// Simple environment detection for both Vite and Jest
const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Utility for tracking performance measurements
 */
export const performanceMonitor = {
  /**
   * Start timing a performance measurement
   * @param label A unique label for this measurement
   */
  start: (label: string) => {
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
      } catch (error) {
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
  track: <T extends (...args: any[]) => any>(fn: T, label: string, threshold = 0): T => {
    if (IS_DEV) {
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
