//src/components/features/Voice/TextToSpeech.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader } from 'lucide-react';

const TextToSpeech = ({ text, autoPlay = false }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const previousTextRef = useRef('');
  
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    if (!isEnabled || !text || text === previousTextRef.current || !autoPlay) {
      return;
    }

    const speakText = async () => {
      try {
        setIsLoading(true);
        cleanup();

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            voice: 'alloy',
            model: 'tts-1',
            speed: 1.0,
            format: 'mp3'
          })
        });

        if (!response.ok) {
          throw new Error('Speech generation failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          cleanup();
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          cleanup();
        };

        await audio.play();
        setIsPlaying(true);
        previousTextRef.current = text;
      } catch (err) {
        console.error('Speech generation error:', err);
        cleanup();
      } finally {
        setIsLoading(false);
      }
    };

    speakText();
  }, [text, isEnabled, autoPlay]);

  const handleToggle = () => {
    if (isEnabled) {
      cleanup();
    }
    setIsEnabled(!isEnabled);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors ${
        isEnabled ? 'bg-sky-600' : 'bg-gray-600'
      } hover:opacity-90 disabled:opacity-50`}
      title={isEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
      type="button"
    >
      {isLoading ? (
        <Loader className="w-5 h-5 text-white animate-spin" />
      ) : isEnabled ? (
        <Volume2 className="w-5 h-5 text-white" />
      ) : (
        <VolumeX className="w-5 h-5 text-white" />
      )}
    </button>
  );
};

export default TextToSpeech;