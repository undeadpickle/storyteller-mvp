import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { logger as appLogger } from '@/utils/debug';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SERVICE_NAME = 'storyGenerator';

if (!GEMINI_API_KEY) {
  appLogger.error(
    SERVICE_NAME,
    new Error(
      'VITE_GEMINI_API_KEY is not set in the environment variables. Story generation disabled.'
    )
  );
}

// --- Safety Settings ---
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// --- Generation Configuration ---
const generationConfig = {
  // temperature: 0.7, // Example: Adjust creativity (0-1)
  // topK: 40,         // Example: Control sampling strategy
  // topP: 0.95,       // Example: Control sampling strategy
  maxOutputTokens: 512, // Limit the length of the generated text
};

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    appLogger.info(`${SERVICE_NAME}: GoogleGenerativeAI client initialized.`);
  } catch (error) {
    appLogger.error(
      SERVICE_NAME,
      new Error(
        `Failed to initialize GoogleGenerativeAI client: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    genAI = null;
  }
} else {
  appLogger.info(`${SERVICE_NAME}: Gemini API key not found. Story generation will be disabled.`);
}

/**
 * Generates a story segment using the Google AI Gemini API.
 *
 * @param prompt The prompt to send to the Gemini API.
 * @returns A promise that resolves with the generated story text.
 * @throws An error if the API key is missing or the API call fails.
 */
export async function generateStorySegment(prompt: string): Promise<string> {
  appLogger.api(SERVICE_NAME, 'generateStorySegment', { promptLength: prompt.length });

  if (!genAI) {
    const errorMsg =
      'Cannot generate story: Gemini client not initialized (API key missing or init failed).';
    appLogger.error(SERVICE_NAME, new Error(errorMsg));
    throw new Error('Story generation service is not configured.');
  }

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      safetySettings,
      generationConfig,
    });

    appLogger.info(`${SERVICE_NAME}: Sending prompt to Gemini API...`);
    const result = await model.generateContent(prompt);
    const response = result.response;

    // TODO: Add more robust checks for blocked content based on safety settings
    if (!response || !response.text) {
      const blockReason = response?.promptFeedback?.blockReason;
      const reasonText = blockReason || 'Unknown';
      appLogger.info(`${SERVICE_NAME}: Gemini response was empty or blocked`, {
        reason: reasonText,
      });
      // Check if blockReason indicates safety issues
      if (blockReason) {
        throw new Error(`Content generation blocked due to safety settings: ${blockReason}`);
      } else {
        throw new Error('Received an empty response from the story generation service.');
      }
    }

    const storyText = response.text();
    appLogger.info(`${SERVICE_NAME}: Successfully generated story segment via Gemini API.`);
    return storyText;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    appLogger.error(
      SERVICE_NAME,
      new Error(`Error generating story segment via Gemini API: ${errorMsg}`)
    );
    // Rethrow a more specific error or handle it as needed
    if (error instanceof Error && error.message.includes('blocked due to safety settings')) {
      throw error; // Re-throw safety errors specifically if needed downstream
    }
    throw new Error('An unknown error occurred during story generation.');
  }
}

// TODO: Add functions for initial story generation and continuations based on choices.
// Example structure:
// export async function startNewStory(theme: string): Promise<{storyText: string; initialChoices?: string[]}> {
//   appLogger.api(SERVICE_NAME, 'startNewStory', { theme });
//   const prompt = `Create the beginning of a children's story about ${theme}. Make it engaging and end with a clear point where the listener can make a choice. Generate 2-3 distinct choices for what happens next. Format the choices clearly at the end, perhaps like [Choice 1: Do X], [Choice 2: Do Y].`;
//   const rawResult = await generateStorySegment(prompt);
//   // TODO: Parse rawResult to separate story text and choices
//   return { storyText: "Parsed story...", initialChoices: ["Choice 1...", "Choice 2..."] };
// }

// export async function continueStory(previousText: string, choiceMade: string): Promise<{storyText: string; choices?: string[]}> {
//    appLogger.api(SERVICE_NAME, 'continueStory', { choiceMade });
//    const prompt = `Continue the following story: "${previousText}". The listener chose to "${choiceMade}". Write the next part of the story, keeping it engaging for children. End with another point where the listener can make a choice, providing 2-3 distinct options like [Choice 1: ...], [Choice 2: ...].`;
//    const rawResult = await generateStorySegment(prompt);
//    // TODO: Parse rawResult
//    return { storyText: "Parsed continuation...", choices: ["Next Choice 1...", "Next Choice 2..."] };
// }
