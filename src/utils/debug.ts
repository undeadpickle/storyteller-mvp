// src/utils/debug.ts

// Use Vite's import.meta.env for environment detection in client-side code
const DEBUG = import.meta.env.DEV;

export const logger = {
  /** Log store-related actions */
  store: (storeName: string, action: string, data?: unknown) => {
    // Use unknown instead of any
    if (DEBUG) {
      // Assuming 'no-console' rule is relaxed for this file via config
      console.group(`%c${storeName} Store: ${action}`, 'color: #3b82f6; font-weight: bold;');
      if (data !== undefined) console.log('Data:', data); // Check for undefined explicitly
      console.groupEnd();
    }
  },

  /** Log API service calls */
  api: (serviceName: string, method: string, data?: unknown) => {
    // Use unknown instead of any
    if (DEBUG) {
      // Assuming 'no-console' rule is relaxed for this file via config
      console.group(`%c${serviceName} API: ${method}`, 'color: #10b981; font-weight: bold;');
      if (data !== undefined) console.log('Data:', data);
      console.groupEnd();
    }
  },

  /** Log errors */
  error: (source: string, error: unknown) => {
    // Use unknown instead of any
    if (DEBUG) {
      // Assuming 'no-console' rule is relaxed for this file via config
      console.group(`%c${source} Error`, 'color: #ef4444; font-weight: bold;');
      console.error(error); // console.error is likely allowed by default or your config
      console.groupEnd();
    }
    // Optionally, send errors to a logging service in production here
  },

  /** Log general information */
  info: (message: string, data?: unknown) => {
    // Use unknown instead of any
    if (DEBUG) {
      // Assuming 'no-console' rule is relaxed for this file via config
      console.group(`%c${message}`, 'color: #8b5cf6; font-weight: bold;');
      if (data !== undefined) console.log(data); // Use console.log or console.info
      console.groupEnd();
    }
  },

  /** Log verbose debugging information */
  debug: (message: string, data?: unknown) => {
    // Use unknown instead of any
    if (DEBUG) {
      // Use console.debug or console.log depending on preference/config
      console.group(`%c${message}`, 'color: #71717a;'); // Dim color for debug
      if (data !== undefined) console.debug('Data:', data);
      console.groupEnd();
    }
  },
};
