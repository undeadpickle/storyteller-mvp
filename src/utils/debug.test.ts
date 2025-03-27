// src/utils/debug.test.ts
import { logger } from './debug';

// Mock console methods
const originalConsoleGroup = console.group;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleGroupEnd = console.groupEnd;

// Test logger functionality
describe('Logger Utility', () => {
  let consoleOutput: any[] = [];

  beforeEach(() => {
    // Mock console methods
    console.group = jest.fn((...args: any[]) => {
      consoleOutput.push(['group', ...args]);
    });

    console.log = jest.fn((...args: any[]) => {
      consoleOutput.push(['log', ...args]);
    });

    console.error = jest.fn((...args: any[]) => {
      consoleOutput.push(['error', ...args]);
    });

    console.groupEnd = jest.fn(() => {
      consoleOutput.push(['groupEnd']);
    });

    // Clear output before each test
    consoleOutput = [];
  });

  afterEach(() => {
    // Restore original console methods
    console.group = originalConsoleGroup;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.groupEnd = originalConsoleGroupEnd;
  });

  test('logger.store logs store actions with correct format', () => {
    logger.store('TestStore', 'testAction', { test: 'data' });

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput[0][0]).toBe('group');
    expect(consoleOutput[0][1]).toContain('TestStore Store: testAction');
    expect(consoleOutput[1][0]).toBe('log');
    expect(consoleOutput[1][1]).toBe('Data:');
    expect(consoleOutput[1][2]).toEqual({ test: 'data' });
  });

  test('logger.api logs API calls with correct format', () => {
    logger.api('TestAPI', 'testMethod', { test: 'data' });

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput[0][0]).toBe('group');
    expect(consoleOutput[0][1]).toContain('TestAPI API: testMethod');
    expect(consoleOutput[1][0]).toBe('log');
    expect(consoleOutput[1][1]).toBe('Data:');
    expect(consoleOutput[1][2]).toEqual({ test: 'data' });
  });

  test('logger.error logs errors with correct format', () => {
    const testError = new Error('Test error');
    logger.error('TestError', testError);

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput[0][0]).toBe('group');
    expect(consoleOutput[0][1]).toContain('TestError Error');
    expect(consoleOutput[1][0]).toBe('error');
    expect(consoleOutput[1][1]).toBe(testError);
  });

  test('logger.info logs general info with correct format', () => {
    logger.info('Test info message', { test: 'data' });

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput[0][0]).toBe('group');
    expect(consoleOutput[0][1]).toContain('Test info message');
    expect(consoleOutput[1][0]).toBe('log');
    expect(consoleOutput[1][1]).toEqual({ test: 'data' });
  });
});
