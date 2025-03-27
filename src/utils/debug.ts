// src/utils/debug.ts

// Simple environment detection for both Vite and Jest
const DEBUG = process.env.NODE_ENV !== 'production';

export const logger = {
  store: (storeName: string, action: string, data?: any) => {
    if (DEBUG) {
      console.group(`%c${storeName} Store: ${action}`, 'color: #3b82f6; font-weight: bold;');
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  },

  api: (serviceName: string, method: string, data?: any) => {
    if (DEBUG) {
      console.group(`%c${serviceName} API: ${method}`, 'color: #10b981; font-weight: bold;');
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  },

  error: (source: string, error: any) => {
    if (DEBUG) {
      console.group(`%c${source} Error`, 'color: #ef4444; font-weight: bold;');
      console.error(error);
      console.groupEnd();
    }
  },

  info: (message: string, data?: any) => {
    if (DEBUG) {
      console.group(`%c${message}`, 'color: #8b5cf6; font-weight: bold;');
      if (data) console.log(data);
      console.groupEnd();
    }
  },
};
