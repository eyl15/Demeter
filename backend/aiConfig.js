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
    description: "List of ingredients in image",
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

const ingredientsAnalysisConfig = {
  temperature: 0.2,
  thinkingConfig: {
    thinkingBudget: -1,
  },
  imageConfig: {
    imageSize: '1K',
  },
  responseMimeType: 'application/json',
  responseSchema: {
    type: 'object',
    properties: {
      include: {
        type: 'array',
        description: 'List of safe ingredients the patient can consume',
        items: {
          type: 'string',
        },
      },
      exclude: {
        type: 'array',
        description: 'List of ingredients to avoid based on medical conditions',
        items: {
          type: 'string',
        },
      },
      healthInsights: {
        type: 'array',
        description: 'Personalized health insights based on patient\'s conditions',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Health area title (e.g., "Blood Pressure Management", "Cholesterol Improvement")',
            },
            summary: {
              type: 'string',
              description: 'Encouraging summary of their progress or actionable guidance',
            },
          },
          required: ['title', 'summary'],
          propertyOrdering: ['title', 'summary'],
        },
      },
      nutritionTips: {
        type: 'string',
        description: 'Actionable nutrition tip tailored to their health conditions',
      },
      smartShopping: {
        type: 'string',
        description: 'Practical shopping advice to support their dietary needs',
      },
    },
    required: ['include', 'exclude', 'healthInsights', 'nutritionTips', 'smartShopping'],
    propertyOrdering: ['include', 'exclude', 'healthInsights', 'nutritionTips', 'smartShopping'],
  },
};


module.exports = {
  fridgeAnalysisConfig,
  ingredientsAnalysisConfig,
};
