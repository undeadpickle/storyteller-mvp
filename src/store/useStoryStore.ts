import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '../utils/debug';

export interface StoryChoice {
  id: string;
  text: string;
}

export interface StorySegment {
  id: string;
  text: string;
  audioUrl: string | null;
  choices: StoryChoice[];
  parentChoiceId: string | null; // Reference to the choice that led to this segment
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  choices: string[];
  correctChoiceIndex: number;
}

export interface StoryProgress {
  profileId: string;
  theme: string; // or prompt
  startedAt: number;
  completedAt: number | null;
  lastSegmentId: string | null;
}

export interface StoryState {
  // Current story state
  currentSegment: StorySegment | null;
  isPlaying: boolean;
  isGenerating: boolean;
  theme: string | null;

  // History for the current story session
  segments: StorySegment[];

  // Story progress by profile
  progress: StoryProgress[];

  // Comprehension questions for the current story
  questions: ComprehensionQuestion[];

  // Actions
  setTheme: (theme: string) => void;
  setCurrentSegment: (segment: StorySegment) => void;
  addSegment: (segment: StorySegment) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setQuestions: (questions: ComprehensionQuestion[]) => void;
  startStory: (profileId: string, theme: string) => void;
  completeStory: (profileId: string) => void;
  resetCurrentStory: () => void;
  getStoryProgress: (profileId: string) => StoryProgress[];
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      // Current story state
      currentSegment: null,
      isPlaying: false,
      isGenerating: false,
      theme: null,

      // History
      segments: [],

      // Progress by profile
      progress: [],

      // Comprehension questions
      questions: [],

      // Actions
      setTheme: theme => {
        logger.store('Story', 'setTheme', { theme });
        set({ theme });
      },

      setCurrentSegment: segment => {
        logger.store('Story', 'setCurrentSegment', {
          segmentId: segment.id,
          textPreview: segment.text.substring(0, 50) + '...',
          choicesCount: segment.choices.length,
        });
        set({ currentSegment: segment });
      },

      addSegment: segment => {
        logger.store('Story', 'addSegment', {
          segmentId: segment.id,
          textLength: segment.text.length,
          hasAudio: !!segment.audioUrl,
          choicesCount: segment.choices.length,
        });

        set(state => ({
          segments: [...state.segments, segment],
          currentSegment: segment,
        }));
      },

      setIsPlaying: isPlaying => {
        logger.store('Story', 'setIsPlaying', { isPlaying });
        set({ isPlaying });
      },

      setIsGenerating: isGenerating => {
        logger.store('Story', 'setIsGenerating', { isGenerating });
        set({ isGenerating });
      },

      setQuestions: questions => {
        logger.store('Story', 'setQuestions', { count: questions.length });
        set({ questions });
      },

      startStory: (profileId, theme) => {
        logger.store('Story', 'startStory', { profileId, theme });

        const newProgress: StoryProgress = {
          profileId,
          theme,
          startedAt: Date.now(),
          completedAt: null,
          lastSegmentId: null,
        };

        set(state => ({
          theme,
          progress: [...state.progress, newProgress],
          // Reset current story state
          currentSegment: null,
          segments: [],
          questions: [],
          isPlaying: false,
          isGenerating: false,
        }));
      },

      completeStory: profileId => {
        logger.store('Story', 'completeStory', { profileId });

        set(state => ({
          progress: state.progress.map(p =>
            p.profileId === profileId && p.completedAt === null
              ? { ...p, completedAt: Date.now() }
              : p
          ),
        }));
      },

      resetCurrentStory: () => {
        logger.store('Story', 'resetCurrentStory');

        set({
          currentSegment: null,
          segments: [],
          questions: [],
          theme: null,
          isPlaying: false,
          isGenerating: false,
        });
      },

      getStoryProgress: profileId => {
        logger.store('Story', 'getStoryProgress', { profileId });
        return get().progress.filter(p => p.profileId === profileId);
      },
    }),
    {
      name: 'storyteller-stories',
      // Only persist progress data
      partialize: state => ({ progress: state.progress }),
      onRehydrateStorage: () => {
        logger.store('Story', 'rehydrated');
      },
    }
  )
);
