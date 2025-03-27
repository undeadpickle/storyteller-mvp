# StoryTeller MVP - Debugging Guide

This document provides an overview of the debugging tools and features available in the StoryTeller MVP project. These tools are designed to help developers identify and resolve issues during development.

## Available Debugging Tools

### 1. Logger Utility

Located in `src/utils/debug.ts`, the logger provides color-coded console groups for different types of logs:

- `logger.store()` - For logging Zustand store activity (blue)
- `logger.api()` - For logging API calls and responses (green)
- `logger.error()` - For logging errors (red)
- `logger.info()` - For logging general information (purple)

Example usage:

```typescript
import { logger } from "../utils/debug";

// Log store actions
logger.store("ProfileStore", "addProfile", { profile });

// Log API calls
logger.api("ElevenLabsService", "convertTextToSpeech", { text: "Hello world" });

// Log errors
try {
  // Some code that might throw
} catch (error) {
  logger.error("Component Name", error);
}

// Log general info
logger.info("App initialized", { version: "1.0.0" });
```

### 2. Performance Monitoring

Located in `src/utils/performance.ts`, this utility helps track execution time:

- `performanceMonitor.start(label)` - Start timing an operation
- `performanceMonitor.end(label, threshold)` - End timing and log if above threshold
- `performanceMonitor.track(fn, label, threshold)` - Wrap a function with performance monitoring

Example usage:

```typescript
import { performanceMonitor } from "../utils/performance";

// Track a synchronous operation
performanceMonitor.start("operation-name");
// ... some code
performanceMonitor.end("operation-name");

// Track a function
const trackedFunction = performanceMonitor.track(
  () => {
    // Function code here
  },
  "function-name",
  50 // Only log if execution takes more than 50ms
);

// Track an async function
const fetchData = performanceMonitor.track(async () => {
  const response = await fetch("/api/data");
  return response.json();
}, "fetch-data");
```

### 3. Component Debugging

The `useComponentDebug` hook in `src/hooks/useComponentDebug.ts` helps track component lifecycle:

```typescript
import { useComponentDebug } from "../hooks/useComponentDebug";

function MyComponent(props) {
  // Log mount/unmount and prop changes
  useComponentDebug("MyComponent", props);

  // Or track specific dependency changes
  useComponentDebug("MyComponent", null, [someDependency]);

  // Rest of component code...
}
```

### 4. Error Boundaries

The `ErrorBoundary` component in `src/components/debug/ErrorBoundary.tsx` catches and displays React errors:

```tsx
import { ErrorBoundary } from "./components/debug/ErrorBoundary";

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
  }}
  fallback={<p>Something went wrong</p>}
>
  <YourComponent />
</ErrorBoundary>;
```

### 5. Debug Panel

The `DebugPanel` component in `src/components/debug/DebugPanel.tsx` provides a real-time view of application state.

- **Toggle with:** `Ctrl+Shift+D` (only in development mode)
- **Features:** Shows current app state, profile state, story state, and more

## Testing Error Handling

The `ErrorTest` component in `src/components/debug/ErrorTest.tsx` can be used to test different error scenarios:

- Render errors (React component errors)
- Promise errors (unhandled rejections)
- Async errors (caught exceptions)

## Best Practices

1. **Use Appropriate Log Levels:**

   - Store actions should use `logger.store()`
   - API calls should use `logger.api()`
   - Errors should use `logger.error()`
   - General info should use `logger.info()`

2. **Performance Monitoring:**

   - Use `performanceMonitor.track()` for functions that might have performance impacts
   - Set appropriate thresholds to avoid console noise

3. **Error Handling:**

   - Wrap components in `ErrorBoundary` to prevent entire app crashes
   - Always log errors with context using `logger.error()`

4. **Component Debugging:**

   - Use `useComponentDebug()` when investigating component re-render issues
   - Be careful with what you log to avoid performance impact

5. **Debug Panel:**
   - Use the debug panel to check state without console logs
   - Press `Ctrl+Shift+D` to toggle it on/off

Remember that most of these tools only run in development mode and won't affect production builds.
