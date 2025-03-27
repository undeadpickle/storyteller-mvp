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

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code
- `npm run lint:fix` - Lint and automatically fix issues
- `npm run format` - Format code with Prettier

## Debugging Tools

StoryTeller includes several debugging utilities to help during development:

- **Logger**: Color-coded console logs for different types of operations
- **Performance Monitor**: Track execution time of functions and operations
- **Component Debug**: Track component lifecycle and props changes
- **Error Boundaries**: Catch and display React errors
- **Debug Panel**: Toggle with `Ctrl+Shift+D` in development mode

Refer to `docs/debugging.md` for detailed information on using these tools.

## Project Structure

```
storyteller-mvp/
├── docs/                  # Documentation
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── models/            # TypeScript interfaces and type definitions
│   ├── prompts/           # AI prompt templates
│   ├── services/          # API service modules
│   ├── store/             # Zustand store modules
│   └── utils/             # Utility functions
└── ...config files
```

## Development Progress

See `docs/progress.md` for the current development status and remaining tasks.

## License

[MIT](LICENSE)
