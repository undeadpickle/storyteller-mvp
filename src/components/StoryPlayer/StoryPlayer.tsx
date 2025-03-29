import { useState, useEffect, useRef, useCallback } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { useStoryEngine } from '@/hooks/useStoryEngine'; // To handle choice selection
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // Example loading icon
import { logger } from '@/utils/debug';
import React from 'react';

// Placeholder for a choice button component (we'll create this later)
const ChoiceButton = ({
  choice,
  onSelect,
}: {
  choice: { id: string; text: string };
  onSelect: (choiceId: string) => void;
}) => (
  <Button onClick={() => onSelect(choice.id)} variant="outline" className="m-1">
    {choice.text.replace(/\[Choice\s*\d*:\s*/, '').replace(/\]$/, '')} {/* Basic text cleaning */}
  </Button>
);

export function StoryPlayer() {
  // Use individual selectors
  const currentSegment = useStoryStore(state => state.currentSegment);
  const isGenerating = useStoryStore(state => state.isGenerating);

  // --- Add Logging ---
  logger.debug('StoryPlayer Render', {
    segmentId: currentSegment?.id,
    hasAudioUrl: !!currentSegment?.audioUrl,
  });
  // --- End Logging ---

  // Get actions and state from the story engine hook
  const { continueStory, isLoading: isEngineLoading, error: engineError } = useStoryEngine();

  // Local state for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrl = currentSegment?.audioUrl;
  const [audioReady, setAudioReady] = useState(false);

  // STEP 1: Monitor audio ref availability - SIMPLIFIED
  useEffect(() => {
    if (audioRef.current) {
      logger.info('StoryPlayer: Audio element ref is now available');
      // Only set the readiness flag
      setAudioReady(true);
    } else {
      logger.info('StoryPlayer: Audio element ref is not available yet');
      setAudioReady(false);
    }
    // We remove the logic that tried to set src here
  }, [audioUrl]); // Run this whenever the audioUrl changes (which causes a remount)

  // STEP 2: Only handle audio setup AFTER the ref is available
  useEffect(() => {
    // Only proceed if both the ref and URL are available
    if (!audioReady || !audioRef.current || !audioUrl) {
      logger.debug('StoryPlayer: Skipping audio setup (not ready, no ref, or no url)', {
        audioReady,
        hasRef: !!audioRef.current,
        hasUrl: !!audioUrl,
      });
      return;
    }

    const audioElement = audioRef.current;

    logger.debug('StoryPlayer: Setting up audio with available ref', {
      audioUrl,
      refAvailable: !!audioElement,
    });

    // Set up basic event listeners
    const handleAudioEnd = () => {
      logger.info('StoryPlayer: Audio playback finished');
      setIsPlaying(false);
    };

    // Add our primary event listeners
    audioElement.addEventListener('ended', handleAudioEnd);

    // Debug event listener to see when canplay fires
    const handleCanPlay = () => {
      logger.info('StoryPlayer: canplay event fired', {
        currentSrc: audioElement.currentSrc,
        readyState: audioElement.readyState,
      });
    };

    audioElement.addEventListener('canplay', handleCanPlay);

    // Set the source and load - ONLY HERE
    // Check if src needs setting (it might already be set if this effect re-runs)
    if (audioElement.src !== audioUrl) {
      logger.info('StoryPlayer: Setting audio source property and loading', { url: audioUrl });
      audioElement.src = audioUrl;
      audioElement.load();
    } else {
      logger.info('StoryPlayer: Audio source already matches, skipping set/load');
    }

    // Cleanup function
    return () => {
      logger.info('StoryPlayer: Cleaning up audio element listeners/state');
      audioElement.removeEventListener('ended', handleAudioEnd);
      audioElement.removeEventListener('canplay', handleCanPlay);
      // Don't pause here, let the next effect handle it if needed
      // We don't revoke the URL here - that's handled separately
    };
  }, [audioReady, audioUrl]); // Run when either the ref becomes available or URL changes

  // STEP 3: Separate effect for URL cleanup and pausing
  useEffect(() => {
    // This runs when audioUrl changes (before the new one is processed)
    // Also capture the audioElement ref here for cleanup
    const audioElement = audioRef.current;
    return () => {
      // Pause playback before revoking
      if (audioElement) {
        logger.info('StoryPlayer: Pausing audio in cleanup');
        audioElement.pause();
        setIsPlaying(false); // Reflect paused state
      }
      // Only revoke previous URL on cleanup
      if (audioUrl && audioUrl.startsWith('blob:')) {
        logger.info('StoryPlayer: Revoking previous blob URL', { url: audioUrl });
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // --- DEFINE HELPER FUNCTION FIRST ---
  // Helper function to handle play with timeout and error recovery
  const tryPlayAudio = useCallback(
    (audioElement: HTMLAudioElement) => {
      logger.info('StoryPlayer: Attempting to play audio');

      // Create a timeout in case play() never resolves or rejects
      const timeoutId = setTimeout(() => {
        logger.error('StoryPlayer', new Error('Play timeout - promise never resolved or rejected'));
      }, 2000);

      audioElement
        .play()
        .then(() => {
          clearTimeout(timeoutId);
          logger.info('StoryPlayer: Play succeeded');
          setIsPlaying(true);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          logger.error('StoryPlayer', new Error(`Play failed: ${error.message}`));
          setIsPlaying(false);
          // Removed recovery logic for simplification during debugging
        });
    },
    [audioUrl, setIsPlaying]
  );
  // --- END HELPER FUNCTION DEFINITION ---

  // --- DEFINE MAIN HANDLER NEXT ---
  // Enhanced play/pause handler
  const handlePlayPause = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl) {
      logger.info('StoryPlayer handlePlayPause: No audio element or url');
      return;
    }

    logger.debug('StoryPlayer handlePlayPause - State before action', {
      currentSrc: audioElement.src,
      currentSrcAttribute: audioElement.getAttribute('src'),
      isPlayingState: isPlaying,
      paused: audioElement.paused,
      readyState: audioElement.readyState,
      networkState: audioElement.networkState,
    });

    if (isPlaying) {
      logger.info('StoryPlayer: Pausing audio');
      audioElement.pause();
      setIsPlaying(false);
    } else {
      // If the src attribute is empty or different from our current audioUrl, reset it
      if (!audioElement.src || (audioUrl && audioElement.src !== audioUrl)) {
        logger.info('StoryPlayer: Resetting src before play attempt', { audioUrl });
        audioElement.src = audioUrl;
        audioElement.load();

        // Give the browser a moment to process the new source
        setTimeout(() => {
          tryPlayAudio(audioElement); // NOW tryPlayAudio is defined
        }, 100);
      } else {
        // Source is already set correctly, try to play immediately
        tryPlayAudio(audioElement); // NOW tryPlayAudio is defined
      }
    }
  }, [isPlaying, audioUrl, tryPlayAudio]); // Add tryPlayAudio dependency
  // --- END MAIN HANDLER DEFINITION ---

  const handleChoiceSelection = (choiceId: string) => {
    logger.debug('StoryPlayer handleChoiceSelection', { choiceId });
    if (!currentSegment || !currentSegment.choices) {
      logger.error(
        'StoryPlayer',
        new Error('handleChoiceSelection: Missing currentSegment or choices')
      );
      return;
    }

    // Find the full choice object based on the id
    const selectedChoice = currentSegment.choices.find(c => c.id === choiceId);

    if (!selectedChoice) {
      logger.error(
        'StoryPlayer',
        new Error(`handleChoiceSelection: Could not find choice with id ${choiceId}`)
      );
      return;
    }

    // Ensure audio is paused before navigating
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Pass the entire choice object to continueStory
    continueStory(selectedChoice);
  };

  // Render logic
  const isLoading = isGenerating || isEngineLoading; // Combine loading states

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-prose mx-auto bg-card text-card-foreground">
      <h2 className="text-xl font-semibold mb-4">Story Time!</h2>

      {/* Loading State (This is for story *generation*, not audio loading) */}
      {isLoading && (
        <div className="flex items-center justify-center my-4 text-primary">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Generating story...</span>
        </div>
      )}

      {/* Error State */}
      {engineError && !isLoading && (
        <div className="my-4 p-3 bg-destructive/20 text-destructive rounded border border-destructive">
          <p>Oops! Something went wrong:</p>
          <p className="text-sm">{engineError}</p>
          {/* TODO: Add a retry button? */}
        </div>
      )}

      {/* Story Content Area */}
      {currentSegment && !isLoading && (
        <div>
          <p className="mb-4 text-lg leading-relaxed">{currentSegment.text}</p>

          {/* Audio Controls */}
          {audioUrl && (
            <div className="flex items-center justify-center my-4">
              {/* Use a fragment with key to ensure proper remounting */}
              <React.Fragment key={audioUrl}>
                <audio
                  ref={audioRef}
                  preload="auto"
                  // REMOVE src attribute from here
                />
              </React.Fragment>

              <Button onClick={handlePlayPause} disabled={!audioUrl}>
                {isPlaying ? 'Pause' : 'Play Audio'}
              </Button>
            </div>
          )}

          {/* Choices Area - Only show if not loading and choices exist */}
          {currentSegment.choices && currentSegment.choices.length > 0 && !isLoading && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-md font-semibold mb-2 text-center">What happens next?</h3>
              <div className="flex flex-wrap justify-center">
                {currentSegment.choices.map(choice => (
                  <ChoiceButton key={choice.id} choice={choice} onSelect={handleChoiceSelection} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial State (No segment yet, not loading) */}
      {!currentSegment && !isLoading && !engineError && (
        <p className="text-center text-muted-foreground">Select a theme to start your story!</p>
      )}
    </div>
  );
}

// Make sure StoryPlayer is the default export if needed, or export directly
// export default StoryPlayer;
