import { useEffect, useCallback } from 'react';
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
import { testDebugSystem } from './utils/manualTests'; // Assuming this is correctly imported
import { ElevenLabsTester } from './components/debug/ElevenLabsTester';
import { StoryPlayer } from './components/StoryPlayer/StoryPlayer';
import StoryInitiation from './components/StoryInitiation/StoryInitiation';
import { useStoryEngine } from './hooks/useStoryEngine';
import { useStoryStore } from './store';
import { Loader2 } from 'lucide-react'; // Import Loader2 icon

function App() {
  // Expose test function in development mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      // @ts-expect-error - Adding to window for testing purposes, acknowledge potential type error
      window.testDebugSystem = testDebugSystem;

      // Use logger.info instead of console.log
      logger.info(
        '📋 Debug Testing Available',
        // Pass empty object if no data, or potentially add styling info if logger supported it
        {}
      );
      logger.info('Run window.testDebugSystem() to verify debugging tools', {});
    }

    // Log app initialization
    logger.info('App initialized', {
      // Consider adding VITE_APP_VERSION to your .env if you want to use it
      // version: import.meta.env.VITE_APP_VERSION || '0.0.0',
      environment: import.meta.env.MODE,
    });

    return () => {
      if (import.meta.env.DEV) {
        // @ts-expect-error - Removing from window, acknowledge potential type error
        delete window.testDebugSystem;
      }
    };
  }, []);

  // Get story engine functions and story state
  const { startNewStory } = useStoryEngine();
  const storySegments = useStoryStore(state => state.segments);
  const isGenerating = useStoryStore(state => state.isGenerating); // Get generating state
  const isStoryActive = storySegments.length > 0;

  const handleThemeSelected = useCallback(
    (theme: string) => {
      startNewStory(theme);
    },
    [startNewStory]
  );

  // Define the loading component
  const InitialLoadingIndicator = () => (
    <div className="flex items-center justify-center my-4 text-primary p-6 border rounded-lg shadow-md max-w-prose mx-auto bg-card text-card-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span>Generating your story... Please wait.</span>
    </div>
  );

  return (
    <ErrorBoundary
      onError={error => {
        logger.error('App Root Error', error);
      }}
    >
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          {/* ElevenLabsTester component for testing the API */}
          {import.meta.env.DEV && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>ElevenLabs API Tester</CardTitle>
                <CardDescription>Test the text-to-speech functionality</CardDescription>
              </CardHeader>
              <CardContent>
                <ElevenLabsTester />
              </CardContent>
            </Card>
          )}

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

          {/* >>> Updated Conditional Rendering Logic <<< */}
          <div className="mt-8">
            {isGenerating && !isStoryActive ? ( // Case 1: Initial generation is happening
              <InitialLoadingIndicator />
            ) : isStoryActive ? ( // Case 2: Story is active (segments exist)
              <StoryPlayer />
            ) : (
              // Case 3: Not generating, no story active (initial state)
              <StoryInitiation onThemeSelected={handleThemeSelected} />
            )}
          </div>

          {/* Test component for Zustand stores */}
          <Card className="mt-8">
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
