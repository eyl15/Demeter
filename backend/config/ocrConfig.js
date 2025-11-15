/**
 * OCR Configuration
 * Modular configuration for different OCR tasks
 * Follows the same pattern as aiConfig.js
 */

const ocrConfigs = {
  medicalDocuments: {
    name: "Medical Document OCR",
    description: "Extract text from medical documents, prescriptions, lab reports",
    pythonConfigType: "medical_documents",
    visionFeatures: ["DOCUMENT_TEXT_DETECTION", "TEXT_DETECTION"],
    languageHints: ["en"],
    batchSize: 10,
    timeout: 30000, // 30 seconds in milliseconds
    resultFormat: "full", // full, text_only, structured
  },

  receipts: {
    name: "Receipt OCR",
    description: "Extract text from receipts and invoices",
    pythonConfigType: "receipts",
    visionFeatures: ["DOCUMENT_TEXT_DETECTION"],
    languageHints: ["en"],
    batchSize: 20,
    timeout: 20000,
    resultFormat: "structured",
  },

  general: {
    name: "General Text OCR",
    description: "Extract text from any image",
    pythonConfigType: "general",
    visionFeatures: ["TEXT_DETECTION"],
    languageHints: ["en"],
    batchSize: 15,
    timeout: 25000,
    resultFormat: "text_only",
  },

  handwriting: {
    name: "Handwriting OCR",
    description: "Extract handwritten text",
    pythonConfigType: "handwriting",
    visionFeatures: ["DOCUMENT_TEXT_DETECTION"],
    languageHints: ["en"],
    batchSize: 5,
    timeout: 40000,
    resultFormat: "full",
  },
};

// Storage paths configuration
const storagePaths = {
  rootFolder: "users",
  imagesSubfolder: "images",
  resultsCollection: "ocr_results",
};

// Result processing configuration
const resultConfigs = {
  firestore: {
    enabled: false, // Disabled - not storing to Firestore
    collectionPath: "{uid}/ocr_results",
    merge: true,
    timestamp: true,
  },

  jsonBackup: {
    enabled: false, // Disabled by default
    outputDir: "./ocr_results",
    filenamePattern: "{uid}_ocr_results_{timestamp}.json",
  },

  storageBackup: {
    enabled: false,
    path: "{uid}/ocr_results/processed_{timestamp}.json",
  },
};

// Error handling configuration
const errorHandling = {
  maxRetries: 3,
  retryDelay: 2000, // milliseconds
  logErrors: true,
  raiseOnFailure: false,
};

/**
 * Get OCR configuration by type
 * @param {string} configType - Type of OCR config
 * @returns {object} OCR configuration
 */
function getOcrConfig(configType = "medicalDocuments") {
  const config = ocrConfigs[configType];
  if (!config) {
    throw new Error(
      `Unknown OCR config type: ${configType}. Available: ${Object.keys(
        ocrConfigs
      ).join(", ")}`
    );
  }
  return config;
}

/**
 * Build storage path dynamically
 * @param {string} pathType - Type of path (images, results)
 * @param {string} uid - User ID
 * @param {string} subfolder - Optional subfolder
 * @returns {string} Formatted storage path
 */
function getStoragePath(pathType, uid = null, subfolder = null) {
  const root = storagePaths.rootFolder;

  if (pathType === "images") {
    const imagesFolder = storagePaths.imagesSubfolder;
    if (uid && subfolder) {
      return `${root}/${uid}/${imagesFolder}/${subfolder}/`;
    } else if (uid) {
      return `${root}/${uid}/${imagesFolder}/`;
    }
    return `${root}/`;
  } else if (pathType === "results") {
    const resultsCollection = storagePaths.resultsCollection;
    if (uid) {
      return `${root}/${uid}/${resultsCollection}/`;
    }
    return resultsCollection;
  } else {
    throw new Error(`Unknown path type: ${pathType}`);
  }
}

module.exports = {
  ocrConfigs,
  storagePaths,
  resultConfigs,
  errorHandling,
  getOcrConfig,
  getStoragePath,
};
