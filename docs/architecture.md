# StoryTeller MVP - Architecture

This document outlines the architecture of the StoryTeller MVP, explaining the core components, state management approach, and data flow.

## Application Structure

This structure reflects the organization of the codebase as of March 27, 2025.

```
.
├── LICENSE                     # Project license
├── README.md                   # Main project overview and instructions
├── components.json             # shadcn/ui configuration
├── docs/                       # Project documentation
│   ├── CONTRIBUTING.md
│   ├── architecture.md         # This file
│   ├── debugging.md
│   ├── progress.md
│   └── storyteller-PRD.md
├── eslint.config.js            # ESLint configuration (ESM format)
├── index.html                  # Main HTML entry point for Vite
├── jest.config.mjs             # Jest test runner configuration
├── jest.setup.mjs              # Jest global setup file
├── package-lock.json           # Exact dependency versions
├── package.json                # Project metadata and dependencies
├── public/                     # Static assets served directly
│   └── vite.svg
├── src/                        # Main application source code
│   ├── App.tsx                 # Root React component
│   ├── tests/              # Integration/Service tests (alternative location)
│   │   └── services/
│   │       └── elevenlabs.test.ts # Test for ElevenLabs service
│   ├── components/             # UI and feature components
│   │   ├── ProfileSelection/   # Components for profile management
│   │   │   └── ProfileSelection.tsx
│   │   ├── StoreTest.tsx       # Component for testing Zustand stores
│   │   ├── StoryInitiation/    # Components for starting a new story
│   │   │   └── StoryInitiation.tsx
│   │   ├── StoryPlayer/        # Components for displaying/interacting with the story
│   │   │   └── StoryPlayer.tsx
│   │   ├── debug/              # Components specifically for debugging
│   │   │   ├── DebugPanel.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ErrorTest.tsx
│   │   └── ui/                 # Reusable base UI components (from shadcn/ui)
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── counter.ts              # Example counter logic (likely from initial Vite setup)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useComponentDebug.test.tsx # Unit test for useComponentDebug hook
│   │   ├── useComponentDebug.ts     # Hook for debugging component lifecycle
│   │   └── useStoryEngine.ts        # Hook for core story generation and audio orchestration
│   ├── index.css               # Main CSS entry point (imports Tailwind)
│   ├── lib/                    # Shared utility libraries/functions
│   │   └── utils.ts            # General utilities (e.g., cn function)
│   ├── main.ts                 # Original Vite JS entry point (may be unused if main.tsx is primary)
│   ├── main.tsx                # Main React application entry point
│   ├── models/                 # TypeScript interfaces and type definitions
│   │   ├── Story.ts            # Interfaces for story data (placeholder)
│   │   └── UserProfile.ts      # Interface for user profile data (placeholder)
│   ├── prompts/                # AI prompt templates and generation logic
│   │   └── storyPrompts.ts     # Prompt templates and utilities for story generation
│   ├── services/               # Modules for interacting with external APIs
│   │   ├── elevenlabs.ts       # Service for ElevenLabs Text-to-Speech API
│   │   └── storyGenerator.ts   # Service for Google Gemini API for text generation
│   ├── store/                  # Zustand state management stores
│   │   ├── index.ts            # Barrel file for exporting stores
│   │   ├── useAppStore.ts      # Store for global app state
│   │   ├── useProfileStore.ts  # Store for user profile management
│   │   └── useStoryStore.ts    # Store for story session state and progress
│   ├── style.css               # Additional global styles (likely from initial Vite setup)
│   ├── typescript.svg          # Asset (likely from initial Vite setup)
│   ├── utils/                  # General utility functions/modules
│   │   ├── debug.test.ts       # Unit test for logger utility
│   │   ├── debug.ts            # Custom logger implementation
│   │   ├── manualTests.ts      # Script for manual testing of debug tools via console
│   │   ├── performance.test.ts # Unit test for performance monitor
│   │   ├── performance.ts      # Performance monitoring utility
│   │   └── storage.ts          # Utility for LocalStorage interactions (placeholder)
│   └── vite-env.d.ts           # Vite TypeScript environment declarations
├── tailwind.config.js        # Tailwind CSS configuration (CJS format)
├── tsconfig.app.json         # TypeScript config specific to app build (if needed)
├── tsconfig.json             # Main TypeScript configuration
└── vite.config.ts            # Vite build tool configuration
```

_(Note: Minor files like `.prettierrc`, `.gitignore`, `.env.example` are omitted for brevity, as are test files colocated in `hooks` and `utils`)_

## Key Components and Data Flow

### Core Components

1.  **`src/App.tsx`**: Main application component, coordinates overall UI, state, and routing (when added). Includes root `ErrorBoundary`.
2.  **`src/components/ProfileSelection/`**: Allows users to create, select, and manage local profiles.
3.  **`src/components/StoryInitiation/`**: Provides theme options or other methods to initiate a story generation request.
4.  **`src/components/StoryPlayer/`**: Handles displaying story text, playing narration audio, and presenting choices to the user.

### State Management (Zustand)

The application uses Zustand for efficient state management, split into logical stores:

1.  **`src/store/useAppStore.ts`**: Manages global application state like loading indicators, global errors, and potentially debug flags.
2.  **`src/store/useProfileStore.ts`**: Handles user profiles, including CRUD operations, setting the active profile, and persisting profile data to `localStorage`.
3.  **`src/store/useStoryStore.ts`**: Manages the state related to the current story session (text segments, choices, audio state, generation status) and tracks overall story progress per profile (persisted minimally to `localStorage`).

### Service Modules

1.  **`src/services/storyGenerator.ts`**: Interfaces with the Google AI Gemini API using the `@google/generative-ai` library to generate story content and choices based on prompts constructed in `storyPrompts.ts`.
2.  **`src/services/elevenlabs.ts`**: Interfaces with the ElevenLabs API via `fetch` to convert generated text segments into speech audio (`.mp3` Blob URLs).

### Prompt Templates

1.  **`src/prompts/storyPrompts.ts`**: Contains functions (`getInitialStoryPrompt`, `getContinuationStoryPrompt`) to generate detailed prompts for the Gemini API, including safety instructions and choice formatting guidelines. Also includes utility functions (`parseChoices`, `stripChoices`) for processing the LLM response.

### Core Logic Flow (`useStoryEngine` Hook)

The central custom hook `src/hooks/useStoryEngine.ts` orchestrates the main story loop:

_(**Note:** Initial implementation required careful refinement of state selection (e.g., using individual selectors in consuming components) and function memoization (`useCallback` with appropriate dependencies, fetching state via `getState()` within callbacks) within the hook and consuming components to prevent infinite rendering loops caused by state update cycles.)_

1.  **Story Initiation Flow** (`startNewStory` function):
    ```
    User selects theme (UI Component) →
    useStoryEngine.startNewStory(theme) triggered →
    Set loading state (isGenerating in useStoryStore) →
    Generate initial prompt (storyPrompts.getInitialStoryPrompt) →
    Call storyGenerator service (Gemini API) →
    Parse choices & strip text (storyPrompts utils) →
    Call elevenlabs service (Generate audio Blob URL) →
    Create StorySegment object (with ID, text, choices, audio URL) →
    Update store (useStoryStore.addSegment) →
    Clear loading state, update UI (StoryPlayer reacts to store changes)
    ```
2.  **Choice Selection Flow** (`continueStory` function):
    ```
    User selects choice (StoryPlayer passes StoryChoice object) →
    useStoryEngine.continueStory(choice) triggered →
    Set loading state →
    Generate continuation prompt (storyPrompts.getContinuationStoryPrompt with previous text & choice) →
    Call storyGenerator service (Gemini API) →
    Parse choices & strip text →
    Call elevenlabs service (Generate audio Blob URL) →
    Create next StorySegment object (linking parentChoiceId) →
    Update store (useStoryStore.addSegment) →
    Clear loading state, update UI
    ```
3.  **Comprehension Questions Flow** (Post-story - _Still Planned_):
    ```
    Story completion detected (Logic TBD) →
    Set loading state →
    storyGenerator service (Gemini API for questions based on story context) →
    Store questions (useStoryStore.setQuestions) →
    Clear loading state → Display questions (UI component TBD)
    ```

## Debugging Infrastructure

The application includes a development-focused debugging system (primarily active via `import.meta.env.DEV` checks):

1.  **Logger (`src/utils/debug.ts`)**: Provides `logger.store`, `logger.api`, `logger.error`, `logger.info`, `logger.debug` for color-coded, grouped console output.
2.  **Performance Monitor (`src/utils/performance.ts`)**: Utilities `performanceMonitor.start`, `performanceMonitor.end`, `performanceMonitor.track` to measure execution time using `window.performance`.
3.  **Component Debug Hook (`src/hooks/useComponentDebug.ts`)**: `useComponentDebug` logs component mount/unmount and dependency changes.
4.  **Debug Panel (`src/components/debug/DebugPanel.tsx`)**: UI overlay toggled by `Ctrl+Shift+D` showing real-time Zustand store state.
5.  **Error Boundaries (`src/components/debug/ErrorBoundary.tsx`)**: Catches rendering errors in component subtrees to prevent app crashes and display fallbacks.
6.  **ElevenLabsTester (`src/components/debug/ElevenLabsTester.tsx`)**: Interactive interface for testing the ElevenLabs text-to-speech API with voice selection and audio playback.
7.  **Manual Tests (`src/utils/manualTests.ts`)**: Console script to verify debugging tools.
8.  **Unit Tests (`*.test.ts`, `*.test.tsx`)**: Jest tests located alongside utilities/hooks or in `src/__tests__` verify functionality, including debugging tools.

## Data Persistence

1.  **Profiles (`useProfileStore.ts`)**: Stored in browser `localStorage` via `zustand/middleware/persist` (key: `storyteller-profiles`).
2.  **Story Progress (`useStoryStore.ts`)**: Minimal progress (theme, start/completion time) stored in `localStorage` via `zustand/middleware/persist` (key: `storyteller-stories`, partialized). Full story segments are _not_ persisted.
