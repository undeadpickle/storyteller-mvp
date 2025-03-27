# StoryTeller MVP - Architecture

This document outlines the architecture of the StoryTeller MVP, explaining the core components, state management approach, and data flow.

## Application Structure

```
storyteller-mvp/
├── docs/                  # Documentation
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── debug/         # Debugging components
│   │   ├── ProfileSelection/  # Profile management UI
│   │   ├── StoryInitiation/   # Story theme selection UI
│   │   ├── StoryPlayer/       # Core story playback component
│   │   └── ui/           # UI components based on shadcn/ui
│   ├── hooks/            # Custom React hooks
│   │   ├── useComponentDebug.ts  # Component lifecycle debugging
│   │   └── useStoryEngine.ts     # Core story generation/playback logic
│   ├── lib/              # Utility libraries
│   │   └── utils.ts      # General utilities
│   ├── models/           # TypeScript interfaces and type definitions
│   │   ├── Story.ts      # Story data models
│   │   └── UserProfile.ts # Profile data models
│   ├── prompts/          # AI prompt templates
│   │   └── storyPrompts.ts # Templates for Gemini API
│   ├── services/         # API service modules
│   │   ├── elevenlabs.ts  # ElevenLabs API integration
│   │   └── storyGenerator.ts # Gemini API integration
│   ├── store/            # Zustand store modules
│   │   ├── useAppStore.ts    # Application state
│   │   ├── useProfileStore.ts # Profile management state
│   │   └── useStoryStore.ts   # Story state
│   └── utils/            # Utility functions
│       ├── debug.ts          # Logging utilities
│       ├── performance.ts    # Performance monitoring
│       └── storage.ts        # LocalStorage interactions
└── ...config files
```

## Key Components and Data Flow

### Core Components

1. **App.tsx**: Main application component that coordinates overall UI and state.

2. **ProfileSelection**: Allows users to create, select, and manage their local profiles.

3. **StoryInitiation**: Provides theme options or other methods to initiate a story.

4. **StoryPlayer**: Handles displaying text, playing audio, and presenting choices.

### State Management (Zustand)

The application uses Zustand for state management, with three main stores:

1. **useAppStore**: Manages application-level state such as loading indicators, errors, and debugging mode.

2. **useProfileStore**: Handles user profiles including:

   - Creating/updating/deleting profiles
   - Setting the active profile
   - Persisting profiles to localStorage

3. **useStoryStore**: Manages story state including:
   - Current story segments
   - Audio playback state
   - Story choices
   - Story progress
   - Comprehension questions

### Service Modules

1. **storyGenerator.ts**: Interfaces with the Google AI Gemini API to generate:

   - Initial story segments
   - Story continuations based on choices
   - Comprehension questions

2. **elevenlabs.ts**: Interfaces with the ElevenLabs API to:
   - Convert text to speech
   - Select voice options
   - Handle audio playback

### Core Logic Flow

1. **Story Initiation Flow**:

   ```
   User selects theme →
   StoryInitiation component →
   useStoryEngine hook →
   storyGenerator service (Gemini API) →
   Store story text in useStoryStore →
   elevenlabs service (ElevenLabs API) →
   Audio is saved and playback begins
   ```

2. **Choice Selection Flow**:

   ```
   User selects choice →
   useStoryEngine hook →
   storyGenerator service (with choice context) →
   Store continuation in useStoryStore →
   elevenlabs service →
   Audio is updated and playback continues
   ```

3. **Comprehension Questions Flow**:
   ```
   Story segment completes →
   useStoryEngine hook →
   storyGenerator service generates questions →
   Questions displayed to user →
   User answers stored in useStoryStore
   ```

## Debugging Infrastructure

The application includes a comprehensive debugging system:

1. **Logger**: Color-coded console logs for different operation types (API, store, errors, info).

2. **Performance Monitor**: Tools to track execution time of functions and identify bottlenecks.

3. **Component Debug**: Hook to monitor component lifecycle and prop changes.

4. **Debug Panel**: Interactive UI panel (toggle with Ctrl+Shift+D) to inspect application state.

5. **Error Boundaries**: Components to catch and display errors without crashing the application.

## Data Persistence

1. **Profiles**: Stored in browser localStorage with the key `storyteller-profiles`.

2. **Story Progress**: Minimal progress tracking stored in localStorage, associated with profiles.
