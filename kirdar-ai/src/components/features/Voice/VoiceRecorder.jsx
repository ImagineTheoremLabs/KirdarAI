//src/components/features/Voice/VoiceRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

const VoiceRecorder = ({ onTranscription, onError, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
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
        try {
          setIsProcessing(true);
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
          await handleTranscription(audioBlob);
        } catch (error) {
          console.error('Processing error:', error);
          onError?.('Failed to process audio');
        } finally {
          setIsProcessing(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          streamRef.current = null;
          mediaRecorderRef.current = null;
          setIsRecording(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      onError?.('Unable to access microphone');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTranscription = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

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
      if (data.text) {
        onTranscription?.(data.text);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      onError?.('Failed to transcribe audio');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <button
      onClick={toggleRecording}
      disabled={disabled || isProcessing}
      className={`p-2 rounded-full transition-colors ${
        isRecording 
          ? 'bg-red-600 hover:bg-red-700' 
          : 'bg-sky-600 hover:bg-sky-700'
      } ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isRecording ? 'Stop recording' : 'Start recording'}
      type="button"
    >
      {isProcessing ? (
        <Loader className="w-5 h-5 text-white animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-5 h-5 text-white" />
      ) : (
        <Mic className="w-5 h-5 text-white" />
      )}
    </button>
  );
};

export default VoiceRecorder;