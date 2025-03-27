import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { logger } from '../../utils/debug';

/**
 * Forces different types of errors for testing error handling
 */
export function ErrorTest() {
  const [showError, setShowError] = useState(false);

  const causeRenderError = () => {
    setShowError(true);
  };

  const causePromiseError = () => {
    // This creates an unhandled promise rejection
    new Promise((_, reject) => {
      reject(new Error('Test Promise Error'));
    });
  };

  const causeAsyncError = async () => {
    try {
      // Simulate an API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test Async Error')), 500);
      });
    } catch (error) {
      logger.error('Async Error Test', error);
    }
  };

  const clearErrorState = () => {
    setShowError(false);
  };

  // This will cause a render error
  if (showError) {
    throw new Error('Test Render Error');
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">Error Testing</h2>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={causeRenderError}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cause Render Error
          </button>

          <button
            onClick={causePromiseError}
            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Cause Promise Error
          </button>

          <button
            onClick={causeAsyncError}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Cause Async Error
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Nested Error Boundary Test</h3>
          <ErrorBoundary
            fallback={
              <div className="bg-red-100 p-2 rounded mt-2">
                <p className="text-red-800">Error caught by nested boundary</p>
                <button
                  onClick={clearErrorState}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Reset
                </button>
              </div>
            }
          >
            <div className="p-2 bg-gray-100 rounded">
              <p>This component has its own error boundary</p>
              <button
                onClick={causeRenderError}
                className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-sm"
              >
                Test Nested Error
              </button>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
