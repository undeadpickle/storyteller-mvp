import { useState, useRef, useCallback } from 'react';
import { useStoryStore, StorySegment, StoryChoice } from '@/store/useStoryStore';
import { generateStorySegment } from '@/services/storyGenerator';
import elevenlabsService from '@/services/elevenlabs';
import {
  getInitialStoryPrompt,
  getContinuationStoryPrompt,
  parseChoices,
  stripChoices,
} from '@/prompts/storyPrompts';
import { logger } from '@/utils/debug';

// Define the shape of the story engine state and actions
interface StoryEngineState {
  isLoading: boolean;
  error: string | null;
}

interface StoryEngineActions {
  startNewStory: (theme: string) => Promise<void>;
  continueStory: (choice: StoryChoice) => Promise<void>;
}

// Helper to generate simple IDs (Replace with UUID later if needed)
const generateId = () => Date.now().toString();

/**
 * Custom hook to manage the story generation and audio playback orchestration.
 * Connects UI interactions to API services and updates the global story state.
 */
export function useStoryEngine(): StoryEngineState & StoryEngineActions {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store actions in refs for stable references
  const actionsRef = useRef({
    addSegment: useStoryStore.getState().addSegment,
    setIsGenerating: useStoryStore.getState().setIsGenerating,
    resetCurrentStory: useStoryStore.getState().resetCurrentStory,
  });

  // Centralized error handler
  const handleApiError = useCallback(
    (context: string, error: unknown) => {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      logger.error('useStoryEngine', new Error(`${context}: ${message}`));
      setError(message);
      // Ensure loading is always stopped on error
      setIsLoading(false);
      actionsRef.current.setIsGenerating(false);
    },
    [actionsRef, setError, setIsLoading] // Added setIsLoading dependency
  );

  /**
   * Starts a new story based on the provided theme.
   * Generates the first segment, choices, and audio.
   */
  const startNewStory = useCallback(
    async (theme: string) => {
      logger.info('useStoryEngine: Starting new story', { theme });
      // Set loading states immediately
      setIsLoading(true);
      setError(null);
      actionsRef.current.setIsGenerating(true);
      actionsRef.current.resetCurrentStory();

      // **** ADDED YIELD ****
      // Yield to the event loop to allow React to render the loading state update
      // before starting potentially long async operations.
      await new Promise(resolve => setTimeout(resolve, 0));
      // **** END ADDED YIELD ****

      try {
        // 1. Generate the prompt for the initial story segment
        const prompt = getInitialStoryPrompt(theme);
        logger.debug('useStoryEngine: Generated initial prompt');

        // 2. Call Gemini API to get the story text and choices
        const rawStoryResult = await generateStorySegment(prompt);
        logger.debug('useStoryEngine: Received response from Gemini');

        // 3. Parse choices and strip them from the display text
        const parsedChoices = parseChoices(rawStoryResult);
        const storyText = stripChoices(rawStoryResult);
        logger.debug('useStoryEngine: Parsed choices and stripped text');

        if (!storyText) {
          throw new Error('Generated story text is empty after stripping choices.');
        }

        // 4. Call ElevenLabs API to get the audio for the story text
        logger.info('useStoryEngine: Generating audio for initial segment...');
        const ttsResponse = await elevenlabsService.convertTextToSpeech(storyText);
        if (ttsResponse.error || !ttsResponse.audioUrl) {
          throw new Error(`Text-to-speech failed: ${ttsResponse.error || 'Unknown error'}`);
        }
        const audioUrl = ttsResponse.audioUrl;
        logger.info('useStoryEngine: Audio generated successfully.');

        // 5. Create StorySegment and update store
        const segmentId = generateId();
        const choices: StoryChoice[] = (parsedChoices ?? []).map((choiceText, index) => ({
          id: `${segmentId}-choice-${index}`,
          text: choiceText, // Store the raw choice text (e.g., "[Choice 1: Go left]")
        }));

        const newSegment: StorySegment = {
          id: segmentId,
          text: storyText,
          audioUrl: audioUrl,
          choices: choices,
          parentChoiceId: null,
        };

        actionsRef.current.addSegment(newSegment);
        setError(null); // Clear error on success
      } catch (err) {
        // Error is logged and state set within handleApiError
        handleApiError('startNewStory failed', err);
      } finally {
        // Loading states are set regardless of success/failure
        setIsLoading(false);
        actionsRef.current.setIsGenerating(false);
        logger.debug('useStoryEngine: startNewStory finally block executed');
      }
    },
    [actionsRef, handleApiError, setError, setIsLoading] // Updated dependencies
  );

  /**
   * Continues the story based on the user's selected choice.
   * Generates the next segment, choices, and audio.
   */
  const continueStory = useCallback(
    async (choice: StoryChoice) => {
      // Get the current segment directly from the store when needed
      const currentSegment = useStoryStore.getState().currentSegment;

      logger.info('useStoryEngine: Continuing story with choice', {
        choiceId: choice.id,
        choiceText: choice.text,
      });
      if (!currentSegment) {
        handleApiError(
          'continueStory prerequisite failed',
          new Error('Cannot continue story without a current segment.')
        );
        return;
      }

      setIsLoading(true);
      setError(null);
      actionsRef.current.setIsGenerating(true);

      // OPTIONAL: Add yield here too if loading indicator between choices is problematic
      // await new Promise(resolve => setTimeout(resolve, 0));

      try {
        // 1. Generate the prompt for the continuation
        const prompt = getContinuationStoryPrompt(currentSegment.text, choice.text);
        logger.debug('useStoryEngine: Generated continuation prompt');

        // 2. Call Gemini API
        const rawStoryResult = await generateStorySegment(prompt);
        logger.debug('useStoryEngine: Received continuation response from Gemini');

        // 3. Parse choices and strip them
        const parsedChoices = parseChoices(rawStoryResult);
        const nextStoryText = stripChoices(rawStoryResult);
        logger.debug('useStoryEngine: Parsed continuation choices and stripped text');

        if (!nextStoryText) {
          throw new Error('Generated continuation text is empty after stripping choices.');
        }

        // 4. Call ElevenLabs API
        logger.info('useStoryEngine: Generating audio for continuation segment...');
        const ttsResponse = await elevenlabsService.convertTextToSpeech(nextStoryText);
        if (ttsResponse.error || !ttsResponse.audioUrl) {
          throw new Error(`Text-to-speech failed: ${ttsResponse.error || 'Unknown error'}`);
        }
        const nextAudioUrl = ttsResponse.audioUrl;
        logger.info('useStoryEngine: Continuation audio generated successfully.');

        // 5. Create next StorySegment and update store
        const nextSegmentId = generateId();
        const nextChoices: StoryChoice[] = (parsedChoices ?? []).map((choiceText, index) => ({
          id: `${nextSegmentId}-choice-${index}`,
          text: choiceText,
        }));

        const nextSegment: StorySegment = {
          id: nextSegmentId,
          text: nextStoryText,
          audioUrl: nextAudioUrl,
          choices: nextChoices,
          parentChoiceId: choice.id, // Link this segment to the choice that triggered it
        };

        actionsRef.current.addSegment(nextSegment);
        setError(null); // Clear error on success
      } catch (err) {
        handleApiError('continueStory failed', err);
      } finally {
        setIsLoading(false);
        actionsRef.current.setIsGenerating(false);
        logger.debug('useStoryEngine: continueStory finally block executed');
      }
    },
    [actionsRef, handleApiError, setError, setIsLoading] // Updated dependencies
  );

  return {
    isLoading,
    error,
    startNewStory,
    continueStory,
  };
}
