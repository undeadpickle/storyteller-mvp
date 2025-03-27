// Jest setup file

// Mock browser globals that aren't available in the test environment
globalThis.crypto = {
  randomUUID: () => "test-uuid",
};

// Add any other global setup needed for tests here
