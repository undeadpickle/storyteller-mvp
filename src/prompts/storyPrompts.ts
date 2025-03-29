// src/prompts/storyPrompts.ts

// --- Safety Instructions (Included in each prompt) ---
const safetyInstructions = `
IMPORTANT SAFETY RULES:
- This story is for young children. Ensure all content is strictly age-appropriate, safe, positive, and avoids any scary, violent, controversial, or inappropriate themes.
- Do not include any characters or scenarios that could be frightening or upsetting to a child.
- Keep the tone light, encouraging, and friendly.
- Do not ask for or reference any personal information.
- If the user's request seems unsafe or inappropriate, politely decline and suggest a different, safe theme.
`;

// --- Formatting Instructions (Included in choice-generating prompts) ---
const choiceFormattingInstructions = `
FORMATTING FOR CHOICES:
- When you present choices, clearly label them using bracketed tags like [Choice 1: Describe the choice], [Choice 2: Describe the choice].
- Ensure there are exactly 2 or 3 distinct choices presented.
- Make the choice descriptions clear and concise (max 15 words each).
- The story text leading up to the choices should naturally pause, setting up the decision point.
`;

/**
 * Generates the initial prompt for starting a new story.
 *
 * @param theme - The theme chosen by the user (e.g., "a friendly dinosaur", "a magical garden").
 * @param characterName - (Optional) A name for the main character.
 * @param setting - (Optional) A specific setting detail.
 * @returns The formatted prompt string for the Gemini API.
 */
export function getInitialStoryPrompt(
  theme: string,
  characterName?: string,
  setting?: string
): string {
  let prompt = `You are a master storyteller for young children (ages 3-6). Write the very beginning of an imaginative and engaging short story based on the following theme: "${theme}".\n`;

  if (characterName) {
    prompt += `The main character's name is ${characterName}.\n`;
  }
  if (setting) {
    prompt += `The story takes place in/at ${setting}.\n`;
  }

  prompt += `\nKeep the language simple and direct for a young audience. Make the beginning about 2-4 sentences long. \nEnd this first part of the story at a natural point where the listener needs to make a decision about what happens next. \nGenerate exactly 2 or 3 distinct choices for the listener to pick from. These choices should guide the next step in the adventure.\n`;

  prompt += choiceFormattingInstructions;
  prompt += safetyInstructions;

  return prompt;
}

/**
 * Generates the prompt for continuing a story based on the user's choice.
 *
 * @param previousStoryText - The text of the story segment just told.
 * @param choiceMade - The text of the choice the user selected (e.g., "Explore the sparkling cave").
 * @returns The formatted prompt string for the Gemini API.
 */
export function getContinuationStoryPrompt(previousStoryText: string, choiceMade: string): string {
  // Extract the core choice text if it's formatted like "[Choice X: Actual Choice Text]"
  const choiceMatch = choiceMade.match(/\[Choice\s*\d*:\s*(.*?)\]/);
  const cleanedChoice = choiceMatch ? choiceMatch[1].trim() : choiceMade;

  let prompt = `You are a master storyteller for young children (ages 3-6). Continue the story based on the listener's choice. \n\nPREVIOUS PART:\n"${previousStoryText}"\n\nLISTENER'S CHOICE: "${cleanedChoice}"\n\nWrite the next part of the story (about 2-4 sentences long). It should flow naturally from the previous part and the choice made. \nKeep the language simple, direct, and engaging for a young audience. \nEnd this part of the story at another natural point where the listener needs to make a decision about what happens next. \nGenerate exactly 2 or 3 distinct choices for the listener to pick from.\n`;

  prompt += choiceFormattingInstructions;
  prompt += safetyInstructions;

  return prompt;
}

/**
 * Generates a prompt for concluding a story.
 * (Placeholder - could be used after a set number of steps or based on specific choices)
 *
 * @param fullStoryText - The entire story text compiled so far.
 * @returns The formatted prompt string for the Gemini API.
 */
export function getConclusionStoryPrompt(fullStoryText: string): string {
  let prompt = `You are a master storyteller for young children (ages 3-6). Write a happy and satisfying conclusion to the following story. The story should end neatly and positively.\n\nSTORY SO FAR:\n"${fullStoryText}"\n\nKeep the ending short (1-3 sentences) and appropriate for the story's flow.\n`;

  prompt += safetyInstructions; // Still apply safety rules to the conclusion.

  return prompt;
}

// --- Utility for Parsing Choices ---

/**
 * Parses choices from the generated story text based on the [Choice X: ...] format.
 * @param storyText - The text potentially containing choices.
 * @returns An array of choice strings, or null if no choices are found.
 */
export function parseChoices(storyText: string): string[] | null {
  // Regex to find choices like [Choice 1: Go left] or [Choice: Look inside]
  const choiceRegex = /\[Choice\s*\d*:\s*(.*?)\]/g;
  const choices = [];
  let match;

  while ((match = choiceRegex.exec(storyText)) !== null) {
    // match[1] contains the text inside the brackets after the colon
    choices.push(match[0].trim()); // Push the full "[Choice...]" string
  }

  return choices.length > 0 ? choices : null;
}

/**
 * Removes choice text (like "[Choice 1: ...]") from the story content.
 * @param storyText - The text potentially containing choices.
 * @returns The story text with choice annotations removed.
 */
export function stripChoices(storyText: string): string {
  const choiceRegex = /\[Choice\s*\d*:\s*(.*?)\]/g;
  // Replace the choice pattern with an empty string, potentially trimming whitespace
  return storyText.replace(choiceRegex, '').trim();
}
