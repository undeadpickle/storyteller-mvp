import { logger } from '../utils/debug';

// Types
export interface VoiceOption {
  id: string;
  name: string;
  description?: string;
}

export interface TextToSpeechOptions {
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  error?: string;
}

// Default available voices
export const AVAILABLE_VOICES: VoiceOption[] = [
  { 
    id: "21m00Tcm4TlvDq8ikWAM", 
    name: "Rachel", 
    description: "Calm and clear female voice, ideal for storytelling" 
  },
  { 
    id: "AZnzlk1XvdvUeBnXmlld", 
    name: "Domi", 
    description: "Passionate, emotional male voice" 
  },
  { 
    id: "EXAVITQu4vr4xnSDxMaL", 
    name: "Bella", 
    description: "Gentle female voice with a soft tone" 
  }
];

// Default voice settings
const DEFAULT_OPTIONS: Omit<TextToSpeechOptions, 'voiceId'> = {
  modelId: 'eleven_monolingual_v1',
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0,
  speakerBoost: true
};

/**
 * Helper function to safely create an object URL in browser environments
 */
function createObjectURL(blob: Blob): string {
  try {
    // Some environments may not have URL or createObjectURL
    return URL?.createObjectURL?.(blob) || '';
  } catch (e) {
    logger.error('ElevenLabsService', 'Error creating object URL: ' + e);
    return '';
  }
}

/**
 * Helper function to make fetch requests with error handling
 */
async function makeFetchRequest(url: string, options: RequestInit): Promise<Response> {
  try {
    // Check if fetch is available
    if (typeof fetch !== 'function') {
      throw new Error('Fetch API is not available in this environment');
    }
    return await fetch(url, options);
  } catch (e) {
    logger.error('ElevenLabsService', 'Fetch error: ' + e);
    throw e;
  }
}

/**
 * ElevenLabs API Service for text-to-speech functionality
 */
class ElevenLabsService {
  private apiKey: string;
  private apiUrl: string = 'https://api.elevenlabs.io/v1';
  
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    
    if (!this.apiKey) {
      logger.error('ElevenLabsService', 'API key is missing. Set VITE_ELEVENLABS_API_KEY in your .env file');
    }
  }

  /**
   * Validates if the service is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Converts text to speech using ElevenLabs API
   */
  async convertTextToSpeech(
    text: string, 
    options: Partial<TextToSpeechOptions> = {}
  ): Promise<TextToSpeechResponse> {
    try {
      logger.api('ElevenLabsService', 'convertTextToSpeech', { textLength: text.length, options });
      
      if (!this.isConfigured()) {
        throw new Error('ElevenLabs API key is not configured');
      }

      if (!text.trim()) {
        throw new Error('Text cannot be empty');
      }

      // Combine default options with provided options
      const fullOptions: TextToSpeechOptions = {
        ...DEFAULT_OPTIONS,
        voiceId: options.voiceId || AVAILABLE_VOICES[0].id,
        ...options
      };

      const response = await fetch(
        `${this.apiUrl}/text-to-speech/${fullOptions.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            text,
            model_id: fullOptions.modelId,
            voice_settings: {
              stability: fullOptions.stability,
              similarity_boost: fullOptions.similarityBoost,
              style: fullOptions.style,
              use_speaker_boost: fullOptions.speakerBoost
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs API error: ${response.status} ${errorData.detail || response.statusText}`);
      }

      // The response is the audio data
      const audioBlob = await response.blob();
      
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      logger.api('ElevenLabsService', 'convertTextToSpeech:success', { audioUrl });
      return { audioUrl };
    } catch (error) {
      logger.error('ElevenLabsService', error);
      return { 
        audioUrl: '', 
        error: error instanceof Error ? error.message : 'Unknown error during text-to-speech conversion'
      };
    }
  }

  /**
   * Retrieves available voices from the API
   * Note: For MVP, we're using a static list of voices, but this method
   * could be extended to fetch available voices from the ElevenLabs API
   */
  async getVoices(): Promise<VoiceOption[]> {
    try {
      logger.api('ElevenLabsService', 'getVoices');
      
      if (!this.isConfigured()) {
        throw new Error('ElevenLabs API key is not configured');
      }
      
      // For MVP, we're using the static list to avoid additional API calls
      // This could be replaced with a real API call in the future
      return AVAILABLE_VOICES;
      
      /*
      // Real implementation would look like this:
      // @ts-expect-error - fetch is available in browser environments
      const response = await fetch(`${this.apiUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        description: voice.description || ''
      }));
      */
    } catch (error) {
      logger.error('ElevenLabsService', error);
      // Return the default voices as fallback
      return AVAILABLE_VOICES;
    }
  }
}

// Create a singleton instance
const elevenlabsService = new ElevenLabsService();

export default elevenlabsService; 