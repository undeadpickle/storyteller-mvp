import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import elevenlabsService, { VoiceOption, AVAILABLE_VOICES } from '../../services/elevenlabs';

export const ElevenLabsTester: React.FC = () => {
  const [text, setText] = useState<string>(
    'Hello! This is a test of the ElevenLabs text to speech API.'
  );
  const [selectedVoice, setSelectedVoice] = useState<string>(AVAILABLE_VOICES[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [voices, setVoices] = useState<VoiceOption[]>(AVAILABLE_VOICES);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Check if the service is configured
    setIsConfigured(elevenlabsService.isConfigured());

    // Load available voices
    const loadVoices = async () => {
      try {
        const availableVoices = await elevenlabsService.getVoices();
        setVoices(availableVoices);

        // Set default voice if available
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0].id);
        }
      } catch (err) {
        setError('Failed to load voices');
        console.error(err);
      }
    };

    loadVoices();
  }, [selectedVoice]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
      setError(
        'ElevenLabs API key is not configured. Add VITE_ELEVENLABS_API_KEY to your .env file.'
      );
      return;
    }

    if (!text.trim()) {
      setError('Please enter some text to convert to speech');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await elevenlabsService.convertTextToSpeech(text, {
        voiceId: selectedVoice,
      });

      if (result.error) {
        setError(result.error);
        setAudioUrl(null);
      } else {
        setAudioUrl(result.audioUrl);

        // Play the audio if available
        if (audioRef.current && result.audioUrl) {
          audioRef.current.src = result.audioUrl;
          audioRef.current.play();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setAudioUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isConfigured && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
          ⚠️ ElevenLabs API key is not configured. Add VITE_ELEVENLABS_API_KEY to your .env file.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="voice-select" className="block text-sm font-medium mb-1">
            Select Voice
          </label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={handleVoiceChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            {voices.map(voice => (
              <option key={voice.id} value={voice.id}>
                {voice.name} - {voice.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="text-input" className="block text-sm font-medium mb-1">
            Text to Convert
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={handleTextChange}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            placeholder="Enter text to convert to speech..."
          />
        </div>

        <Button type="submit" disabled={isLoading || !text.trim()}>
          {isLoading ? 'Converting...' : 'Convert to Speech'}
        </Button>
      </form>

      {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">Error: {error}</div>}

      {audioUrl && (
        <div className="mt-4">
          <audio ref={audioRef} controls className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default ElevenLabsTester;