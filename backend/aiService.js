// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

/**
 * Google Gemini AI Service using @google/genai
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const { fridgeAnalysisConfig, ingredientsAnalysisConfig } = require('./aiConfig');

class aiService {
  constructor(apiKey = process.env.GEMINI_API_KEY, firebaseAdmin = null) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
    
    this.ai = new GoogleGenAI({
      apiKey: apiKey,
    });
    
    // Store Firebase Admin reference for fetching health data
    this.admin = firebaseAdmin;
    
    // All configs from aiConfig.js
    this.configs = {
      fridgeAnalysis: fridgeAnalysisConfig,
      ingredientsAnalysis: ingredientsAnalysisConfig,
    };
    // console.log('[VOICE-SERVICE] ✓ Configs set');
  }

  /**
   * Fetch health data from Firebase Storage for a specific user
   * @param {string} uid - User ID
   * @returns {Promise<Object|null>} Health data JSON or null if not found
   */
  async fetchHealthData(uid) {
    if (!this.admin) {
      console.warn('Firebase Admin not configured, skipping health data fetch');
      return null;
    }

    try {
      const bucket = this.admin.storage().bucket();
      const prefix = `${uid}/healthdata/`;
      const [files] = await bucket.getFiles({ prefix });

      if (!files || files.length === 0) {
        console.warn(`No health data found for uid: ${uid}`);
        return null;
      }

      // Sort by timestamp in filename to get the latest
      const latestFile = files.sort((a, b) => {
        const aFileName = a.name.split('/').pop() || '';
        const bFileName = b.name.split('/').pop() || '';
        const aTime = parseInt(aFileName.split('-')[0] || '0');
        const bTime = parseInt(bFileName.split('-')[0] || '0');
        return bTime - aTime;
      })[0];

      const [contents] = await latestFile.download();
      const jsonData = JSON.parse(contents.toString('utf-8'));
      return jsonData;
    } catch (error) {
      console.error('Error fetching health data:', error);
      return null;
    }
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

  /**
   * Categorize ingredients based on medical report
   * @param {string} medicalReportText - Full text from OCR of medical report
   * @param {Array<string>} ingredients - List of available ingredients from fridge
   * @param {string} uid - User ID to fetch health data from Firebase
   * @returns {Promise<Object>} Response with include/exclude arrays
   */
  async categorizeIngredients(medicalReportText, ingredients, uid = null) {
    const promptPath = path.join(__dirname, 'prompts', 'includeExclude.txt');
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`includeExclude.txt not found at ${promptPath}`);
    }
    
    let prompt = fs.readFileSync(promptPath, 'utf-8').trim();
    
    // Replace placeholders with actual data
    prompt = prompt.replace('// Report from api/process_ocr', medicalReportText);
    prompt = prompt.replace('// Report from api/analyze-fridge', JSON.stringify(ingredients));
    
    // Fetch and inject health data if uid is provided
    let healthDataText = 'None';
    if (uid) {
      const healthData = await this.fetchHealthData(uid);
      if (healthData) {
        healthDataText = JSON.stringify(healthData, null, 2);
      }
    }

    prompt = prompt.replace('// Report from uid/healthdata', healthDataText);

    // console.log(prompt);
    
    const model = 'gemini-2.5-pro';
    
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    return this.generateContent(model, contents, this.configs.ingredientsAnalysis);
  }
}

module.exports = aiService;

