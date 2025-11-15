// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

/**
 * Google Gemini AI Service using @google/genai
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const { fridgeAnalysisConfig } = require('./aiConfig');

class aiService {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
    
    this.ai = new GoogleGenAI({
      apiKey: apiKey,
    });
    
    // All configs from aiConfig.js
    this.configs = {
      fridgeAnalysis: fridgeAnalysisConfig,
    };
  }

    /**
   * Analyze image with text prompt
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} mimeType - Image MIME type
   * @param {string} prompt - Text prompt for analysis
   * @param {Object} config - Configuration to use
   * @returns {Promise<Object|string>} Response
   */
  async analyzeImage(imageBuffer, mimeType, prompt, config = this.configs.fridgeAnalysis) {
    const model = 'gemini-2.5-pro';
    
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBuffer.toString('base64'),
            },
          },
        ],
      },
    ];

    return this.generateContent(model, contents, config);
  }

  /**
   * Generate content using Gemini
   * @param {string} model - Model name
   * @param {Array} contents - Array of content objects
   * @param {Object} config - Generation configuration
   * @returns {Promise<Object|string>} Parsed JSON response or text
   */
  async generateContent(model, contents, config) {
    const response = await this.ai.models.generateContent({
      model,
      config,
      contents,
    });

    // If response is JSON, parse it
    if (config.responseMimeType === 'application/json') {
      try {
        return JSON.parse(response.text);
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        return null;
      }
    }
    
    // Otherwise return plain text
    return response.text;
  }

  /**
   * Analyze fridge image using scanner.txt prompt
   * @param {Buffer} imageBuffer - Fridge image buffer
   * @param {string} mimeType - Image MIME type
   * @returns {Promise<Object>} Response with Ingredients array
   */

  async analyzeFridgeImage(imageBuffer, mimeType) {
    const promptPath = path.join(__dirname, 'prompts', 'scanner.txt');
    
    // console.log('Looking for prompt at:', promptPath);
    // console.log('File exists?', fs.existsSync(promptPath));
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`scanner.txt not found at ${promptPath}`);
    }
    
    const prompt = fs.readFileSync(promptPath, 'utf-8').trim();
    // console.log('Prompt loaded:', prompt);

    return this.analyzeImage(imageBuffer, mimeType, prompt, this.configs.fridgeAnalysis);
  }
}

module.exports = aiService;

