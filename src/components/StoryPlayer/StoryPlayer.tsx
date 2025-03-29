import { useState, useEffect, useRef } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { useStoryEngine } from '@/hooks/useStoryEngine'; // To handle choice selection
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // Example loading icon
import { logger } from '@/utils/debug';

// Placeholder for a choice button component (we'll create this later)
const ChoiceButton = ({
  choice,
  onSelect,
}: {
  choice: { id: string; text: string };
  onSelect: (choice: { id: string; text: string }) => void;
}) => (
  <Button onClick={() => onSelect(choice)} variant="outline" className="m-1">
    {choice.text.replace(/\[Choice\s*\d*:\s*/, '').replace(/\]$/, '')} {/* Basic text cleaning */}
  </Button>
);

export function StoryPlayer() {
  // Use individual selectors
  const currentSegment = useStoryStore(state => state.currentSegment);
  const isGenerating = useStoryStore(state => state.isGenerating);

  // Get actions and state from the story engine hook
  const { continueStory, isLoading: isEngineLoading, error: engineError } = useStoryEngine();

  // Local state for audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Effect to handle audio source changes and play/pause logic
  const audioUrl = currentSegment?.audioUrl;
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleAudioEnd = () => {
      logger.info('StoryPlayer', 'Audio playback finished');
      setIsPlaying(false);
    };

    // Reset and load new audio when URL changes
    if (audioUrl) {
      logger.info('StoryPlayer', 'New audio URL detected, loading...');
      audioElement.src = audioUrl;
      audioElement.load(); // Preload the audio
      setIsPlaying(false); // Ensure it starts paused
    } else {
      // Clear src if no audio URL
      audioElement.src = '';
      setIsPlaying(false);
    }

    // Add event listener for when audio ends
    audioElement.addEventListener('ended', handleAudioEnd);

    // Cleanup: remove listener when component unmounts or audio changes
    return () => {
      audioElement.removeEventListener('ended', handleAudioEnd);
      // Optionally pause and revoke URL if needed
      // if (audioElement.src && audioElement.src.startsWith('blob:')) {
      //   URL.revokeObjectURL(audioElement.src);
      // }
    };
  }, [audioUrl]); // Dependency: only re-run when audioUrl changes

  const handlePlayPause = () => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioElement.src || audioElement.readyState < 2) {
      // Ensure audio is ready
      logger.info('StoryPlayer', 'Audio not ready or no source');
      return;
    }

    if (isPlaying) {
      audioElement.pause();
      logger.info('StoryPlayer', 'Audio paused');
    } else {
      audioElement
        .play()
        .catch(err => logger.error('StoryPlayer', new Error(`Audio play error: ${err}`)));
      logger.info('StoryPlayer', 'Audio playing');
    }
    setIsPlaying(!isPlaying);
  };

  const handleChoiceSelection = (choice: { id: string; text: string }) => {
    logger.info('StoryPlayer: Choice selected', { choiceId: choice.id });
    // Stop current audio playback before continuing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    // Trigger the story engine to continue with the selected choice
    continueStory(choice);
  };

  // Render logic
  const isLoading = isGenerating || isEngineLoading; // Combine loading states

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-prose mx-auto bg-card text-card-foreground">
      <h2 className="text-xl font-semibold mb-4">Story Time!</h2>

      {/* Loading State */}
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

          {/* Audio Controls - Only show if audio URL exists */}
          {audioUrl && (
            <div className="flex items-center justify-center my-4">
              <audio ref={audioRef} preload="auto" />
              <Button
                onClick={handlePlayPause}
                disabled={!audioUrl || audioRef.current?.readyState === 0}
              >
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
