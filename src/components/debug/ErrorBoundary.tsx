import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../utils/debug';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component to catch and log React errors
 * Usage: <ErrorBoundary fallback={<p>Something went wrong</p>}><YourComponent /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    logger.error('React Error Boundary', { error, componentStack: errorInfo.componentStack });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h2 className="text-red-800 font-bold">Something went wrong</h2>
            <details className="mt-2">
              <summary className="text-sm text-red-600 cursor-pointer">View error details</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
