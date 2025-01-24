const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add this at the top of your audioRoutes.js file
router.get('/test', (req, res) => {
  res.json({ message: 'Audio routes working' });
});

// @route   POST /api/audio/transcribe
// @desc    Transcribe audio to text
// @access  Private
router.post('/transcribe', protect, upload.single('audio'), async (req, res) => {
  console.log('Transcribe route hit');
  console.log('Request file:', req.file ? 'File present' : 'No file');
  console.log('Headers:', req.headers);
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Audio transcription error:', error);
    res.status(500).json({ message: 'Failed to transcribe audio' });
  }
});

// @route   POST /api/audio/speech
// @desc    Convert text to speech
// @access  Private
router.post('/speech', protect, async (req, res) => {
  try {
    const { 
      text, 
      voice = 'nova',               // Default voice
      model = 'tts-1',             // Default model
      speed = 1.0,                 // Default speed
      format = 'mp3'               // Default format
    } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'No text provided' });
    }

    // Validate parameters
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const validModels = ['tts-1', 'tts-1-hd'];
    
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ message: 'Invalid voice option' });
    }

    if (!validModels.includes(model)) {
      return res.status(400).json({ message: 'Invalid model option' });
    }

    if (speed < 0.25 || speed > 4.0) {
      return res.status(400).json({ message: 'Speed must be between 0.25 and 4.0' });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        speed,
        response_format: format
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Set appropriate content type based on format
    const contentTypes = {
      mp3: 'audio/mpeg',
      opus: 'audio/opus',
      aac: 'audio/aac',
      flac: 'audio/flac',
      wav: 'audio/wav',
      pcm: 'audio/pcm'
    };

    res.set('Content-Type', contentTypes[format] || 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      message: 'Failed to generate speech',
      error: error.message
    });
  }
});

module.exports = router;