// src/hooks/useComponentDebug.test.tsx
import { render, cleanup } from '@testing-library/react';
import { useComponentDebug } from './useComponentDebug';
import { logger } from '../utils/debug';

// Create a test component that uses the hook
function TestComponent({ prop1, prop2 }: { prop1: string; prop2: number }) {
  useComponentDebug('TestComponent', { prop1, prop2 });
  return <div>Test Component</div>;
}

// Mock the logger
jest.mock('../utils/debug', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('useComponentDebug Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('logs mount when component renders', () => {
    render(<TestComponent prop1="test" prop2={123} />);

    expect(logger.info).toHaveBeenCalledWith('TestComponent mounted', {
      prop1: 'test',
      prop2: 123,
    });
  });

  test('logs unmount when component is removed', () => {
    const { unmount } = render(<TestComponent prop1="test" prop2={123} />);

    // Clear the mount log
    (logger.info as jest.Mock).mockClear();

    // Unmount the component
    unmount();

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('TestComponent unmounted'));
  });
});
