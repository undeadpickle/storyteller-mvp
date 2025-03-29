# StoryTeller MVP

StoryTeller is an interactive storytelling application designed for children (ages 4-10) that dynamically generates engaging, branching narratives using AI. Stories are narrated with expressive voice to foster imagination and early literacy skills.

## Features

- Dynamic story generation using Google AI Gemini API
- Expressive voice narration via ElevenLabs API
- Interactive branching narratives with choices
- Comprehension questions to reinforce reading skills
- Local user profiles with avatars
- Simple, child-friendly UI

## Technology Stack

- React with TypeScript
- Vite for build tooling
- Zustand for state management
- Tailwind CSS with shadcn/ui for styling
- Jest for testing

## Prerequisites

- Node.js (latest LTS version)
- npm or yarn

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd storyteller-mvp
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file based on `.env.example` and add your API keys:

   ```
   VITE_ELEVENLABS_API_KEY=your_eleven_labs_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

## Available Scripts

- `npm run dev` - Start the development server with hot reload.
- `npm run build` - Build the app for production (includes type checking).
- `npm run preview` - Preview the production build locally.
- `npm run test` - Run tests using Jest.
- `npm run test:watch` - Run tests in interactive watch mode.
- `npm run lint` - Lint code using ESLint (configuration in `eslint.config.js`).
- `npm run lint:fix` - Lint and automatically fix issues where possible.
- `npm run format` - Format code with Prettier.

## Debugging Tools

StoryTeller includes several debugging utilities to help during development:

- **Logger**: Provides methods like `logger.store`, `logger.api`, `logger.error`, `logger.info`, and `logger.debug` for color-coded, grouped console output (See `src/utils/debug.ts`).
- **Performance Monitor**: Track execution time of functions and operations using `window.performance` (See `src/utils/performance.ts`).
- **Component Debug Hook**: Track component lifecycle (mount/unmount) and dependency changes (`useComponentDebug` hook, See `src/hooks/useComponentDebug.ts`).
- **Error Boundaries**: Catch and display React rendering errors gracefully (See `src/components/debug/ErrorBoundary.tsx`).
- **Debug Panel**: Toggle an overlay panel with `Ctrl+Shift+D` in development mode to inspect application state (See `src/components/debug/DebugPanel.tsx`).
- **ElevenLabs API Tester**: Interactive component for testing text-to-speech functionality (See `src/components/debug/ElevenLabsTester.tsx`).

Refer to `docs/debugging.md` for detailed information on using these tools.

## Project Structure

```
storyteller-mvp/
├── docs/              # Documentation
├── public/            # Static assets
├── src/
│   ├── components/    # React components (UI, features, debug)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Shared libraries (e.g., cn utility)
│   ├── models/        # TypeScript interfaces and type definitions
│   ├── prompts/       # AI prompt templates
│   ├── services/      # API service modules (ElevenLabs, Gemini)
│   ├── store/         # Zustand store modules
│   └── utils/         # Utility functions (debug, performance, storage)
├── eslint.config.js   # ESLint configuration (ESM format)
├── tailwind.config.js # Tailwind CSS configuration (CJS format)
├── vite.config.ts     # Vite configuration
└── ...other config files (tsconfig, package.json, etc.)
```
