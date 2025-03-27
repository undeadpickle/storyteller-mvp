// src/utils/performance.test.ts
import { performanceMonitor } from './performance';

// Mock window.performance methods
const originalPerformanceMark = window.performance.mark;
const originalPerformanceMeasure = window.performance.measure;
const originalPerformanceGetEntries = window.performance.getEntriesByName;
const originalPerformanceClearMarks = window.performance.clearMarks;
const originalPerformanceClearMeasures = window.performance.clearMeasures;

// Mock console methods to avoid noise in test output
jest.spyOn(console, 'group').mockImplementation();
jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'groupEnd').mockImplementation();

describe('Performance Monitor Utility', () => {
  beforeEach(() => {
    // Mock performance API
    window.performance.mark = jest.fn();
    window.performance.measure = jest.fn();
    window.performance.getEntriesByName = jest.fn().mockReturnValue([
      { duration: 100 }, // Mock measurement result
    ]);
    window.performance.clearMarks = jest.fn();
    window.performance.clearMeasures = jest.fn();
  });

  afterEach(() => {
    // Restore original methods
    window.performance.mark = originalPerformanceMark;
    window.performance.measure = originalPerformanceMeasure;
    window.performance.getEntriesByName = originalPerformanceGetEntries;
    window.performance.clearMarks = originalPerformanceClearMarks;
    window.performance.clearMeasures = originalPerformanceClearMeasures;

    jest.restoreAllMocks();
  });

  test('start() creates a performance mark', () => {
    performanceMonitor.start('test-operation');

    expect(window.performance.mark).toHaveBeenCalledWith('test-operation-start');
  });

  test('end() measures performance and cleans up', () => {
    performanceMonitor.end('test-operation');

    expect(window.performance.mark).toHaveBeenCalledWith('test-operation-end');
    expect(window.performance.measure).toHaveBeenCalledWith(
      'test-operation',
      'test-operation-start',
      'test-operation-end'
    );
    expect(window.performance.clearMarks).toHaveBeenCalledWith('test-operation-start');
    expect(window.performance.clearMarks).toHaveBeenCalledWith('test-operation-end');
    expect(window.performance.clearMeasures).toHaveBeenCalledWith('test-operation');
  });

  test('track() wraps a synchronous function with performance monitoring', () => {
    const mockFn = jest.fn().mockReturnValue('result');
    const trackedFn = performanceMonitor.track(mockFn, 'tracked-function');

    const result = trackedFn();

    expect(result).toBe('result');
    expect(window.performance.mark).toHaveBeenCalledWith('tracked-function-start');
    expect(window.performance.mark).toHaveBeenCalledWith('tracked-function-end');
  });

  test('track() handles promises correctly', async () => {
    const mockFn = jest.fn().mockResolvedValue('async-result');
    const trackedFn = performanceMonitor.track(mockFn, 'tracked-async');

    const result = await trackedFn();

    expect(result).toBe('async-result');
    expect(window.performance.mark).toHaveBeenCalledWith('tracked-async-start');
    expect(window.performance.mark).toHaveBeenCalledWith('tracked-async-end');
  });
});
