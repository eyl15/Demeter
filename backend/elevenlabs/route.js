const express = require('express');
const VoiceService = require('../voiceService');
require('dotenv/config');

const router = express.Router();
let voiceService;

try {
  voiceService = new VoiceService();
  console.log('Voice Service initialized');
} catch (error) {
  console.warn('Voice Service not initialized:', error.message);
}

/**
 * POST /api/text-to-speech
 * Converts text to speech using ElevenLabs
 * 
 * Request body:
 * {
 *   text: string - The text to convert to speech
 *   voiceId: string - The ElevenLabs voice ID to use
 *   modelId?: string - The model to use (default: "eleven_multilingual_v2")
 *   outputFormat?: string - Output format (default: "mp3_44100_128")
 * }
 * 
 * Response: Audio stream (mp3)
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    if (!voiceService) {
      return res.status(503).json({ error: 'Voice service not available' });
    }

    const { text, voiceId, modelId, outputFormat } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!voiceId) {
      return res.status(400).json({ error: 'Voice ID is required' });
    }

    // Call voice service
    const options = {};
    if (modelId) options.modelId = modelId;
    if (outputFormat) options.outputFormat = outputFormat;

    const result = await voiceService.textToSpeech(text, voiceId, options);
    return res.json(result);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to convert text to speech',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
});

module.exports = router;
