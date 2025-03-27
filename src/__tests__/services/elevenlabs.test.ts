// src/__tests__/services/elevenlabs.test.ts
import elevenlabsService, { AVAILABLE_VOICES } from '../../services/elevenlabs';

// Mock logger to prevent console output during tests
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

// Store original globals
const originalFetch = global.fetch;
const originalURL = global.URL;
const originalProcessEnv = process.env;

describe('ElevenLabsService', () => {
  // Define mocks
  const mockFetch = jest.fn();
  const mockCreateObjectURL = jest.fn(() => 'blob:http://localhost/mock-url');
  const mockRevokeObjectURL = jest.fn(); // Add mock for revokeObjectURL if needed

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockClear();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear(); // Clear revoke mock too

    // Assign mocks to global scope
    global.fetch = mockFetch;

    // Improved URL mock - Create a mock class/object that matches the structure
    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
      // Add other static methods or properties if your code uses them
      // Provide a basic constructor mock if needed, though often just mocking static methods is enough
      // If you actually instantiate URL with 'new URL(...)', you'll need a class mock:
      // class MockURL { constructor() {} } // Basic example
      // global.URL = class MockURL { ... static methods ... } as any;
    } as any; // Use 'as any' for simplicity if full typing is complex, or type it properly

    // Mock process.env
    process.env = {
      ...originalProcessEnv, // Preserve other env vars
      VITE_ELEVENLABS_API_KEY: MOCK_API_KEY,
    };

    // Reset the service instance to pick up the mocked env var
    jest.resetModules();
    // Dynamically import the service *after* mocks are set up
    // Note: This might require changes if the service isn't easily re-importable.
    // Consider dependency injection for easier testing as an alternative.
    // For now, let's assume resetModules works or adjust the test structure if needed.
  });

  afterEach(() => {
    // Restore original globals
    global.fetch = originalFetch;
    global.URL = originalURL;

    // Restore process.env
    process.env = originalProcessEnv;

    // Clean up modules cache if resetModules was used
    jest.resetModules();
  });

  it('has default voices available', () => {
    expect(AVAILABLE_VOICES.length).toBeGreaterThan(0);
    expect(AVAILABLE_VOICES[0]).toHaveProperty('id');
    expect(AVAILABLE_VOICES[0]).toHaveProperty('name');
  });
  
  it('returns available voices', async () => {
    const voices = await elevenlabsService.getVoices();
    expect(voices).toEqual(AVAILABLE_VOICES);
  });
  
  it('handles missing API key', async () => {
    process.env.VITE_ELEVENLABS_API_KEY = undefined;
    
    const result = await elevenlabsService.convertTextToSpeech('Hello world');
    
    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/API key is not configured/);
    expect(result.audioUrl).toBe('');
  });

  it('should return an error if text is empty', async () => {
    const result = await elevenlabsService.convertTextToSpeech('');
    expect(result.audioUrl).toBe('');
    expect(result.error).toContain('Text cannot be empty');
    expect(mockFetch).not.toHaveBeenCalled(); // Ensure fetch wasn't called
  });
}); 