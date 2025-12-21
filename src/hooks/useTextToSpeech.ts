import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/api';

// ----------------------------------------------------------------------

interface UseTextToSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTextRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    currentTextRef.current = null;
  }, []);

  const speak = useCallback(async (text: string) => {
    // If same text is playing, stop it
    if (currentTextRef.current === text && isPlaying) {
      stop();
      return;
    }

    // Stop any current audio
    stop();
    
    if (!text.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    currentTextRef.current = text;

    try {
      // Call backend API to get audio
      const audioBlob = await apiService.textToSpeech(text);
      
      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        currentTextRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        currentTextRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      setIsPlaying(true);
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
      currentTextRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, stop]);

  return {
    speak,
    stop,
    isLoading,
    isPlaying,
    error,
  };
}
