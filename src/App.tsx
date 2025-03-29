import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter, // Keep commented/removed if not used
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StoreTest } from './components/StoreTest';
import { ErrorBoundary } from './components/debug/ErrorBoundary';
import { DebugPanel } from './components/debug/DebugPanel';
import { logger } from './utils/debug';
import { testDebugSystem } from './utils/manualTests';
import { ElevenLabsTester } from './components/debug/ElevenLabsTester';
import { StoryPlayer } from './components/StoryPlayer/StoryPlayer';
import StoryInitiation from './components/StoryInitiation/StoryInitiation';
import { useStoryEngine } from './hooks/useStoryEngine';
import { useStoryStore } from './store';
// import { Loader2 } from 'lucide-react'; // Keep Loader2 import, though not used in temp loader

function App() {
  // useEffect for exposing testDebugSystem in dev mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      // @ts-expect-error - Adding to window for testing purposes
      window.testDebugSystem = testDebugSystem;
      logger.info('📋 Debug Testing Available: Run window.testDebugSystem() in console.', {});
    }
    logger.info('App initialized', { environment: import.meta.env.MODE });
    return () => {
      if (import.meta.env.DEV) {
        // @ts-expect-error - Removing from window
        delete window.testDebugSystem;
      }
    };
  }, []);

  // --- State and Engine Hook ---
  const { startNewStory } = useStoryEngine();
  const storySegments = useStoryStore(state => state.segments);
  const isGenerating = useStoryStore(state => state.isGenerating);
  const isStoryActive = storySegments.length > 0;

  // --- Callbacks ---
  const handleThemeSelected = useCallback(
    (theme: string) => {
      startNewStory(theme);
    },
    [startNewStory]
  );

  // --- Components ---

  // Temporary, highly visible loading indicator for testing
  const InitialLoadingIndicator = () => (
    <div
      style={{
        position: 'fixed', // Ensure it's easily visible
        top: '40%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '20px',
        backgroundColor: 'yellow', // Bright color
        color: 'black', // Contrasting text
        border: '2px solid red', // Obvious border
        zIndex: 1000, // Ensure it's on top
        fontSize: '24px', // Large text
        textAlign: 'center',
      }}
    >
      GENERATING STORY... PLEASE WAIT! (TEST)
    </div>
  );

  // --- Diagnostic Logging ---
  logger.debug('App Component Render State', {
    isGenerating,
    isStoryActive,
    segmentCount: storySegments.length,
    condition1_ShowLoader: isGenerating && !isStoryActive,
    condition2_ShowPlayer: isStoryActive,
    condition3_ShowInitiation: !isGenerating && !isStoryActive,
  });

  // --- Render ---
  return (
    <ErrorBoundary
      onError={error => {
        logger.error('App Root Error', error);
      }}
    >
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          {/* ElevenLabs Tester (Dev Only) */}
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

          {/* Header Card */}
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
              {/* Dev mode test button */}
              {import.meta.env.DEV && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => testDebugSystem()}>
                    Test Debug System
                  </Button>
                </div>
              )}
            </CardContent>
            {/* <CardFooter className="flex justify-between">
              <Button variant="outline">Learn More</Button>
              <Button>Get Started</Button>
            </CardFooter> */}
          </Card>

          {/* Main Content Area: Initiation / Loader / Player */}
          <div className="mt-8">
            {isGenerating && !isStoryActive ? (
              <InitialLoadingIndicator /> // Using the temporary visible loader
            ) : isStoryActive ? (
              <StoryPlayer />
            ) : (
              <StoryInitiation onThemeSelected={handleThemeSelected} />
            )}
          </div>

          {/* State Management Test Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>State Management Test</CardTitle>
              <CardDescription>Testing Zustand store functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <StoreTest />
            </CardContent>
          </Card>
        </div>{' '}
        {/* End Container */}
        {/* Debug Panel (Dev Only) */}
        <DebugPanel />
      </div>{' '}
      {/* End Background Div */}
    </ErrorBoundary>
  );
}

export default App;
