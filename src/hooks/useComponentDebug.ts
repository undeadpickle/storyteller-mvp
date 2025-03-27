import { useEffect, useRef } from 'react';
import { logger } from '../utils/debug';

/**
 * Hook to debug component lifecycle events (mount, unmount, dependency changes)
 * Logs information to the console during development.
 *
 * @param componentName Name of the component for logging purposes.
 * @param props Optional: Current props object to log on mount/change.
 * Warning: Using props directly as a dependency can cause excessive logging
 * if the props object reference changes on every render. Consider passing
 * specific prop values or ensuring the props object is memoized if used here.
 * @param dependencies Optional: Array of dependencies to monitor for changes, similar to useEffect.
 */
export function useComponentDebug(
  componentName: string,
  props?: Record<string, unknown>, // Use more specific type than 'any'
  dependencies?: ReadonlyArray<unknown> // Use more specific type than 'any[]'
) {
  // Call Hooks UNCONDITIONALLY at the top level
  const renderCount = useRef(0);
  const prevDeps = useRef<ReadonlyArray<unknown> | undefined>(dependencies);

  // --- Effect for Mount and Unmount ---
  useEffect(() => {
    // Conditional logic moved INSIDE the effect
    if (!import.meta.env.DEV) {
      return; // Do nothing in production builds
    }

    logger.info(`${componentName} mounted`, props);
    renderCount.current = 1; // Initialize render count on mount

    // Cleanup function runs on unmount
    return () => {
      // Conditional logic moved INSIDE the cleanup
      if (!import.meta.env.DEV) {
        return; // Do nothing in production builds
      }
      logger.info(`${componentName} unmounted after ${renderCount.current} renders`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentName]); // Keep dependencies for mount/unmount logic only

  // --- Effect for Dependency Changes ---
  // This effect runs *after* the initial mount and whenever 'dependencies' array changes.
  useEffect(() => {
    // Conditional logic moved INSIDE the effect
    if (!import.meta.env.DEV) {
      return; // Do nothing in production builds
    }

    // Skip effect if dependencies array wasn't provided or is empty
    if (!dependencies || dependencies.length === 0) return;

    // Don't compare on the very first render (renderCount is 1 after mount effect)
    // or if prevDeps hasn't been set yet.
    if (renderCount.current > 1 && prevDeps.current) {
      // Find indices of dependencies that actually changed value
      const changedDepsIndices = dependencies
        .map((dep, i) => {
          // Compare current dep with previous dep at the same index
          const prevDep = prevDeps.current?.[i];
          return !Object.is(prevDep, dep) ? i : -1; // Use Object.is for comparison
        })
        .filter(i => i !== -1); // Keep only indices that changed

      // Log if any dependencies changed
      if (changedDepsIndices.length > 0) {
        const changedDepsData: Record<string, { prev: unknown; current: unknown }> = {};
        changedDepsIndices.forEach(index => {
          changedDepsData[index] = {
            prev: prevDeps.current?.[index],
            current: dependencies[index],
          };
        });

        logger.debug(`${componentName} dependencies changed`, {
          changedIndices: changedDepsIndices,
          // Uncomment below to log the actual changed values (can be verbose)
          // changedValues: changedDepsData,
          renderCount: renderCount.current,
        });
      }
    }

    // Update previous dependencies ref *after* comparison for the next render
    prevDeps.current = dependencies;
    // Increment render count *after* potential logging for the current render cycle
    renderCount.current++;
    // Add dependencies used within this effect: componentName and the dependencies array itself
  }, [componentName, dependencies]);
}
