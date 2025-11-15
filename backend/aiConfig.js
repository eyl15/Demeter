/**
 * Gemini AI Configuration
 * Separate configs for different use cases
 */

const { Type } = require('@google/genai');

/**
 *  configuration for fridge ingredient detection
 */

const fridgeAnalysisConfig = {
  temperature: 0.2,
  thinkingConfig: {
    thinkingBudget: -1,
  },
  imageConfig: {
    imageSize: '1K',
  },
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    required: ["Ingredients"],
    properties: {
      Ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  },
};


module.exports = {
  fridgeAnalysisConfig,
};
