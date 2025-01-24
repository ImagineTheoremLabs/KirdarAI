// src/components/features/Voice/VoiceInterface.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader } from 'lucide-react';

const VoiceInterface = ({ 
  onTranscription, 
  onError,
  isProcessing,
  text = '',
  isSpeaking = false,
  onSpeakComplete,
  onToggleTextToSpeech,
  isTextToSpeechEnabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const lastSpokenTextRef = useRef('');
  const streamRef = useRef(null);

  // **1. Cleanup function must be defined before it's used**
  const cleanupStream = useCallback(async () => {
    console.log('Cleaning up stream...');
    // Stop all active tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.enabled = false;
        track.stop();
      });
      streamRef.current = null;
    }
    // Stop the media recorder if it's active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
  }, []);

  const handleTranscription = async (blob) => {
    try {
      setIsTranscribing(true);
      console.log('Transcribing audio...');
      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/audio/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      console.log('Transcription result:', data.text);
      if (data.text) {
        onTranscription(data.text);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      onError(err.message || 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  // **2. startRecording uses cleanupStream, ensure it's defined after cleanupStream**
  const startRecording = useCallback(async () => {
    try {
      // Ensure previous streams are closed before starting a new recording
      await cleanupStream(); 
      console.log('Starting recording...');

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped. Handling transcription...');
        try {
          if (chunksRef.current.length > 0) {
            const audioBlob = new Blob(chunksRef.current, { 
              type: 'audio/webm;codecs=opus' 
            });
            await handleTranscription(audioBlob);
          }
        } finally {
          await cleanupStream();
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      onError('Microphone access denied or not available');
      await cleanupStream();
    }
  }, [cleanupStream, onError]);

  // **3. stopRecording uses cleanupStream as well**
  const stopRecording = useCallback(async () => {
    console.log('Stop recording triggered...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      await cleanupStream();
    }
    setIsRecording(false);
  }, [cleanupStream]);

  // **4. toggleRecording references startRecording and stopRecording**
  const toggleRecording = useCallback(async () => {
    console.log('Toggle recording. Currently recording:', isRecording);
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  // Handle text-to-speech effect
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    
    const speakText = async () => {
      if (!text || !isSpeaking || !isTextToSpeechEnabled || text === lastSpokenTextRef.current) return;
  
      try {
        console.log('Performing text-to-speech...');
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
          }),
          signal: controller.signal
        });
  
        if (!response.ok) {
          throw new Error('Speech generation failed');
        }
  
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current = null;
        }
        
        if (!mounted) return;
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.addEventListener('ended', () => {
          if (mounted) {
            console.log('Text-to-speech playback ended.');
            onSpeakComplete?.();
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
          }
        });
        
        await audioRef.current.play();
        lastSpokenTextRef.current = text;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Speech generation error:', err);
        onError(err.message);
      }
    };
  
    speakText();
  
    return () => {
      mounted = false;
      controller.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
    };
  }, [text, isSpeaking, isTextToSpeechEnabled, onSpeakComplete, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
    };
  }, [cleanupStream]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleRecording}
        disabled={isProcessing || isTranscribing}
        className={`p-2 rounded-full transition-colors ${
          isRecording 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-sky-600 hover:bg-sky-700'
        } ${(isProcessing || isTranscribing) ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isTranscribing ? (
          <Loader className="w-5 h-5 text-white animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </button>

      <button
        onClick={onToggleTextToSpeech}
        className={`p-2 rounded-full transition-colors ${
          isTextToSpeechEnabled ? 'bg-sky-600' : 'bg-gray-600'
        } hover:opacity-90`}
        title={isTextToSpeechEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
      >
        {isTextToSpeechEnabled ? (
          <Volume2 className="w-5 h-5 text-white" />
        ) : (
          <VolumeX className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
};

export default VoiceInterface;
