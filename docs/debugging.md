# StoryTeller MVP - Debugging Guide

This document provides an overview of the debugging tools and features available in the StoryTeller MVP project. These tools are designed to help developers identify and resolve issues during development.

## Available Debugging Tools

### 1. Logger Utility

Located in `src/utils/debug.ts`, the logger provides color-coded console groups for different types of logs. It utilizes standard `console` methods (`log`, `info`, `warn`, `error`, `debug`, `group`, `groupEnd`) internally, which are configured as allowed in the project's ESLint setup.

- `logger.store()` - For logging Zustand store activity (blue)
- `logger.api()` - For logging API calls and responses (green)
- `logger.error()` - For logging errors (red)
- `logger.info()` - For logging general information (purple)
- `logger.debug()` - For logging verbose debugging details (grey)

Example usage:

```typescript
import { logger } from '../utils/debug';

// Log store actions
logger.store('ProfileStore', 'addProfile', { profile });

// Log API calls
logger.api('ElevenLabsService', 'convertTextToSpeech', { text: 'Hello world' });

// Log errors
try {
  // Some code that might throw
} catch (error) {
  logger.error('Component Name', error);
}

// Log general info
logger.info('App initialized', { version: '1.0.0' });

// Log debug details
logger.debug('Checking loop variable', { index: i });
```

### 2. Performance Monitoring

Located in `src/utils/performance.ts`, this utility helps track execution time using the browser's window.performance API. It only runs in development mode (checking import.meta.env.DEV).

- `performanceMonitor.start(label)` - Start timing an operation
- `performanceMonitor.end(label, threshold)` - End timing and log to console (using logger.info) if duration exceeds the optional threshold (in milliseconds).
- `performanceMonitor.track(fn, label, threshold)` - Wrap a function (sync or async) with performance monitoring.

Example usage:

```typescript
import { performanceMonitor } from '../utils/performance';

// Track a synchronous operation
performanceMonitor.start('operation-name');
// ... some code
performanceMonitor.end('operation-name'); // Logs if > 0ms by default

// Track a function, only log if it takes > 50ms
const trackedFunction = performanceMonitor.track(
  () => {
    // Function code here
  },
  'function-name',
  50 // Only log if execution takes more than 50ms
);
const result = trackedFunction();

// Track an async function
const fetchData = performanceMonitor.track(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  'fetch-data',
  100
); // Log if fetch takes > 100ms
const data = await fetchData();
```

### 3. Component Debugging Hook

The `useComponentDebug` hook in `src/hooks/useComponentDebug.ts` helps track component lifecycle events (mount/unmount) and optionally changes in specified dependencies.

Important: This hook calls React hooks (useRef, useEffect) unconditionally as required by the Rules of Hooks. The logging logic inside the effects is conditional and only runs in development mode (import.meta.env.DEV).

```typescript
import { useComponentDebug } from '../hooks/useComponentDebug';

function MyComponent(props) {
  // Log mount/unmount and pass props (logged on mount)
  // Warning: Logging props object directly might be noisy if reference changes often.
  useComponentDebug('MyComponent', props);

  // Or track specific dependency changes (logs when dependencies change after mount)
  useComponentDebug('MyComponent', null, [someDependency, anotherValue]);

  // Rest of component code...
}
```

### 4. Error Boundaries

The `ErrorBoundary` component in `src/components/debug/ErrorBoundary.tsx` catches JavaScript errors during rendering in its child component tree, logs them using logger.error, and displays a fallback UI instead of crashing the whole app.

```typescript
import { ErrorBoundary } from "./components/debug/ErrorBoundary";

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Optional: Custom error handling in addition to logging
    // e.g., send report to an external service
  }}
  fallback={<p>Something went wrong loading this section.</p>}
>
  <YourPotentiallyCrashingComponent />
</ErrorBoundary>
```

### 5. Debug Panel

The `DebugPanel` component in `src/components/debug/DebugPanel.tsx` provides a real-time overlay view of application state, useful for inspecting Zustand store contents without excessive console logging.

- Toggle with: `Ctrl+Shift+D` (only works in development mode, checks import.meta.env.DEV)
- Features: Shows current app state (loading, error), profile state (active profile, list), story state (theme, generating status, progress), and provides actions like clearing the console.

## Environment Checks

Note that debugging utilities often rely on checking the environment. Use Vite's `import.meta.env.DEV` boolean flag for checks in browser-facing code (like utils, hooks, components) instead of Node.js's `process.env.NODE_ENV`.

```typescript
// Example check in a utility or component
if (import.meta.env.DEV) {
  // Run debug-specific logic
  logger.debug('Running in development mode');
}
```

## Best Practices

### Use Appropriate Logger Levels:

- Store actions: `logger.store()`
- API calls: `logger.api()`
- Errors: `logger.error()` (catches, uncaught exceptions)
- General info: `logger.info()`
- Detailed steps: `logger.debug()`

### Performance Monitoring:

- Use `performanceMonitor.track()` for functions/operations prone to slowness.
- Set reasonable threshold values to avoid console noise for fast operations.

### Error Handling:

- Wrap potentially unstable components or sections in `<ErrorBoundary>`.
- Always log caught errors with context using `logger.error()`.

### Component Debugging:

- Use `useComponentDebug()` judiciously when investigating re-renders or prop/dependency changes. Logging props directly can be very verbose.

### Debug Panel:

- Utilize the `Ctrl+Shift+D` panel to inspect state changes without manually logging store contents everywhere.

Remember that most of these tools (logging, performance marks, debug hook logic, debug panel) are designed to only be active in development mode (`import.meta.env.DEV`) and should have minimal or no impact on production builds.
