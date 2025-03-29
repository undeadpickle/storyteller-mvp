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

  // No need to select currentSegment here anymore
  // const currentSegment = useStoryStore(state => state.currentSegment);

  // Store actions in refs for stable references
  const actionsRef = useRef({
    addSegment: useStoryStore.getState().addSegment,
    setIsGenerating: useStoryStore.getState().setIsGenerating,
    resetCurrentStory: useStoryStore.getState().resetCurrentStory,
  });

  const handleApiError = useCallback(
    (context: string, error: unknown) => {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      logger.error('useStoryEngine', new Error(`${context}: ${message}`));
      setError(message);
      actionsRef.current.setIsGenerating(false);
    },
    [actionsRef, setError]
  );

  /**
   * Starts a new story based on the provided theme.
   * Generates the first segment, choices, and audio.
   */
  const startNewStory = useCallback(
    async (theme: string) => {
      logger.info('useStoryEngine: Starting new story', { theme });
      setIsLoading(true);
      setError(null);
      actionsRef.current.setIsGenerating(true);
      actionsRef.current.resetCurrentStory();

      try {
        // 1. Generate the prompt for the initial story segment
        const prompt = getInitialStoryPrompt(theme);

        // 2. Call Gemini API to get the story text and choices
        const rawStoryResult = await generateStorySegment(prompt);

        // 3. Parse choices and strip them from the display text
        const parsedChoices = parseChoices(rawStoryResult);
        const storyText = stripChoices(rawStoryResult);

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
          text: choiceText,
        }));

        const newSegment: StorySegment = {
          id: segmentId,
          text: storyText,
          audioUrl: audioUrl,
          choices: choices,
          parentChoiceId: null,
        };

        actionsRef.current.addSegment(newSegment);
        setError(null);
      } catch (err) {
        handleApiError('startNewStory failed', err);
      } finally {
        setIsLoading(false);
        actionsRef.current.setIsGenerating(false);
      }
    },
    [actionsRef, handleApiError, setError, setIsLoading]
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

      try {
        // 1. Generate the prompt for the continuation
        const prompt = getContinuationStoryPrompt(currentSegment.text, choice.text);

        // 2. Call Gemini API
        const rawStoryResult = await generateStorySegment(prompt);

        // 3. Parse choices and strip them
        const parsedChoices = parseChoices(rawStoryResult);
        const nextStoryText = stripChoices(rawStoryResult);

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
          parentChoiceId: choice.id,
        };

        actionsRef.current.addSegment(nextSegment);
        setError(null);
      } catch (err) {
        handleApiError('continueStory failed', err);
      } finally {
        setIsLoading(false);
        actionsRef.current.setIsGenerating(false);
      }
    },
    [actionsRef, handleApiError, setError, setIsLoading]
  );

  return {
    isLoading,
    error,
    startNewStory,
    continueStory,
  };
}
