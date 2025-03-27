import { useEffect, useRef } from 'react';
import { logger } from '../utils/debug';

/**
 * Hook to debug component lifecycle events
 * @param componentName Name of the component for logging
 * @param props Optional props to log (be careful with sensitive data)
 * @param dependencies Optional dependencies to watch for changes
 */
export function useComponentDebug(
  componentName: string,
  props?: Record<string, any>,
  dependencies?: any[]
) {
  const renderCount = useRef(0);
  const prevDeps = useRef<any[] | undefined>(dependencies);

  // Log mount and unmount
  useEffect(() => {
    logger.info(`${componentName} mounted`, props);
    renderCount.current = 1;

    return () => {
      logger.info(`${componentName} unmounted after ${renderCount.current} renders`);
    };
  }, [componentName]);

  // Log dependency changes if provided
  useEffect(() => {
    if (!dependencies || dependencies.length === 0) return;

    if (prevDeps.current) {
      // Find which dependencies changed
      const changedDeps = dependencies
        .map((dep, i) => {
          const prevDep = prevDeps.current?.[i];
          return prevDep !== dep ? i : -1;
        })
        .filter(i => i !== -1);

      if (changedDeps.length > 0) {
        logger.info(`${componentName} dependencies changed`, {
          changedIndexes: changedDeps,
          renderCount: renderCount.current,
        });
      }
    }

    prevDeps.current = dependencies;
    renderCount.current++;
  }, dependencies || []);
}
