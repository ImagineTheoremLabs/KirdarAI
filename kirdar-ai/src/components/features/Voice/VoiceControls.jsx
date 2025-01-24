//src/components/features/Voice/VoiceControls.jsx
import React from 'react';
import VoiceRecorder from './VoiceRecorder';
import TextToSpeech from './TextToSpeech';

const VoiceControls = ({ 
  onTranscription, 
  onError, 
  disabled, 
  text,
  autoPlay 
}) => {
  return (
    <div className="flex items-center gap-2">
      <VoiceRecorder 
        onTranscription={onTranscription}
        onError={onError}
        disabled={disabled}
      />
      <TextToSpeech 
        text={text}
        autoPlay={autoPlay}
      />
    </div>
  );
};

export default VoiceControls;
