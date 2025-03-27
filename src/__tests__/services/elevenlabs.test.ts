// src/__tests__/services/elevenlabs.test.ts
import { AVAILABLE_VOICES } from '../../services/elevenlabs';

// Mock logger to prevent console output during tests
// Assuming logger is correctly mocked elsewhere or this structure works for your setup
jest.mock('../../utils/debug', () => ({
  logger: {
    api: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock environment variables
const MOCK_API_KEY = 'test-api-key';

// Store original globals using globalThis
const originalFetch = globalThis.fetch;
const originalURL = globalThis.URL;
const originalProcessEnv = process.env;

describe('ElevenLabsService', () => {
  // Define mocks
  const mockFetch = jest.fn();
  const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/mock-url');
  const mockRevokeObjectURL = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockClear();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();

    // Assign mocks to global scope using globalThis
    globalThis.fetch = mockFetch;

    // Mock globalThis.URL
    // Removed the eslint-disable-next-line comment as the rule is off for test files now
    globalThis.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
      // Add other static methods or properties if your code uses them
    } as any; // Using 'as any' for simplicity in mocking complex browser API

    // Mock process.env
    process.env = {
      ...originalProcessEnv, // Preserve other env vars
      VITE_ELEVENLABS_API_KEY: MOCK_API_KEY,
    };

    // Reset modules to ensure the service might re-read env vars if needed
    // This is important if the service caches the API key on initialization.
    jest.resetModules();
    // Note: Depending on how elevenlabsService is exported/imported, you might
    // need to re-require it here if jest.resetModules isn't enough, e.g.:
    // elevenlabsService = require('../../services/elevenlabs').default;
  });

  afterEach(() => {
    // Restore original globals
    globalThis.fetch = originalFetch;
    globalThis.URL = originalURL;

    // Restore process.env
    process.env = originalProcessEnv;

    // Clean up modules cache
    jest.resetModules();
  });

  it('has default voices available', () => {
    expect(AVAILABLE_VOICES.length).toBeGreaterThan(0);
    expect(AVAILABLE_VOICES[0]).toHaveProperty('id');
    expect(AVAILABLE_VOICES[0]).toHaveProperty('name');
  });

  it('returns available voices', async () => {
    // Re-import service instance after potential resetModules in beforeEach/afterEach
    const currentElevenlabsService = (await import('../../services/elevenlabs')).default;
    const voices = await currentElevenlabsService.getVoices();
    expect(voices).toEqual(AVAILABLE_VOICES);
  });

  it('handles missing API key', async () => {
    process.env.VITE_ELEVENLABS_API_KEY = undefined;
    // Crucial: Reset modules again AFTER changing env var for this specific test case
    jest.resetModules();
    // Re-import the service to get instance initialized with the *new* (missing) env var
    const updatedElevenlabsService = (await import('../../services/elevenlabs')).default;

    const result = await updatedElevenlabsService.convertTextToSpeech('Hello world');

    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/API key is not configured/);
    expect(result.audioUrl).toBe('');
    expect(mockFetch).not.toHaveBeenCalled(); // Ensure API wasn't called
  });

  it('should return an error if text is empty', async () => {
    // Re-import service instance after potential resetModules
    const currentElevenlabsService = (await import('../../services/elevenlabs')).default;
    const result = await currentElevenlabsService.convertTextToSpeech('');
    expect(result.audioUrl).toBe('');
    expect(result.error).toContain('Text cannot be empty');
    expect(mockFetch).not.toHaveBeenCalled(); // Ensure fetch wasn't called
  });

  // Add more tests here:
  // - Test successful API call mock (mockFetch.mockResolvedValueOnce(...))
  // - Test API error handling (mockFetch.mockResolvedValueOnce({ ok: false, ... }))
  // - Test different voice options if applicable
}); // Ensured newline exists after this line
