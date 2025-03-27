import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StoreTest } from './components/StoreTest';
import { ErrorBoundary } from './components/debug/ErrorBoundary';
import { DebugPanel } from './components/debug/DebugPanel';
import { logger } from './utils/debug';
import { testDebugSystem } from './utils/manualTests';
import { useEffect } from 'react';

function App() {
  // Expose test function in development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      // @ts-ignore - Adding to window for testing purposes
      window.testDebugSystem = testDebugSystem;

      console.log(
        '%c📋 Debug Testing Available',
        'color: #8b5cf6; font-size: 14px; font-weight: bold;'
      );
      console.log('%cRun window.testDebugSystem() to verify debugging tools', 'color: #8b5cf6;');
    }

    // Log app initialization
    logger.info('App initialized', {
      version: import.meta.env.VITE_APP_VERSION || '0.0.0',
      environment: import.meta.env.MODE,
    });

    return () => {
      if (import.meta.env.DEV) {
        // @ts-ignore - Removing from window
        delete window.testDebugSystem;
      }
    };
  }, []);

  return (
    <ErrorBoundary
      onError={error => {
        logger.error('App Root Error', error);
      }}
    >
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>StoryTeller MVP</CardTitle>
              <CardDescription>Interactive storytelling for children</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Welcome to StoryTeller! This MVP will let children explore dynamically generated
                stories with interactive choices.
              </p>

              {/* Development mode test button */}
              {import.meta.env.DEV && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => testDebugSystem()}>
                    Test Debug System
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Learn More</Button>
              <Button>Get Started</Button>
            </CardFooter>
          </Card>

          {/* Test component for Zustand stores */}
          <Card>
            <CardHeader>
              <CardTitle>State Management Test</CardTitle>
              <CardDescription>Testing Zustand store functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreTest />
            </CardContent>
          </Card>
        </div>

        {/* Debug panel (only appears in dev mode) */}
        <DebugPanel />
      </div>
    </ErrorBoundary>
  );
}

export default App;
