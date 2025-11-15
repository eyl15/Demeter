/**
 * ElevenLabs Voice Service
 * Provides an easy-to-use interface for text-to-speech conversion
 */

const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

// console.log('[VOICE-SERVICE] Loading VoiceService class...');

class VoiceService {
  constructor(apiKey = process.env.ELEVENLABS_API_KEY) {
    // console.log('[VOICE-SERVICE] Constructor called');
    // console.log('[VOICE-SERVICE] API Key available:', !!apiKey);
    
    if (!apiKey) {
      const error = "ELEVENLABS_API_KEY not found in environment variables";
      // console.error('[VOICE-SERVICE] ✗', error);
      throw new Error(error);
    }
    
    // console.log('[VOICE-SERVICE] ✓ API Key found, initializing ElevenLabsClient...');
    this.client = new ElevenLabsClient({
      apiKey: apiKey,
    });
    // console.log('[VOICE-SERVICE] ✓ ElevenLabsClient initialized');
    
    // Default configurations
    this.configs = {
      default: {
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      },
    };
    // console.log('[VOICE-SERVICE] ✓ Configs set');
  }

  /**
   * Convert text to speech
   * @param {string} text - Text to convert to speech
   * @param {string} voiceId - ElevenLabs voice ID
   * @param {Object} options - Options object
   * @param {string} options.modelId - Model to use (default: eleven_multilingual_v2)
   * @param {string} options.outputFormat - Output format (default: mp3_44100_128)
   * @returns {Promise<Stream>} Audio stream
   */
  async textToSpeech(text, voiceId, options = {}) {
    try {
      if (!text) {
        throw new Error('Text is required');
      }

      if (!voiceId) {
        throw new Error('Voice ID is required');
      }

      const config = { ...this.configs.default, ...options };

      const audio = await this.client.textToSpeech.convert(voiceId, {
        text,
        modelId: config.modelId,
        outputFormat: config.outputFormat,
      });

      // Convert stream to buffer
      const chunks = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString('base64');
      
      return {"audio": audioBase64};

    } catch (error) {
      // console.error('Text-to-speech conversion error:', error);
      throw error;
    }
  }
}

module.exports = VoiceService;
