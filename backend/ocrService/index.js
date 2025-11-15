/**
 * OCR Service
 * Node.js wrapper for Python OCR implementation
 * Follows the same pattern as aiService.js
 */

const { spawn } = require("child_process");
const path = require("path");
const { getOcrConfig, getStoragePath, errorHandling } = require("../config/ocrConfig");

class OCRService {
  /**
   * Initialize OCR Service
   * @param {string} configType - Type of OCR configuration to use
   */
  constructor(configType = "medicalDocuments") {
    this.configType = configType;
    this.config = getOcrConfig(configType);
    this.pythonScriptPath = path.join(__dirname, "..", "ocr", "ocrService.py");
    
    // console.log(` OCRService initialized with config: ${this.config.name}`);
  }

  /**
   * List all images for a user
   * @param {string} uid - User ID
   * @param {string} subfolder - Optional subfolder within images/
   * @returns {Promise<Array<string>>} List of image file paths
   */
  async listUserImages(uid, subfolder = null) {
    try {
      const result = await this._executePythonOCR(uid, subfolder, null, true);
      return result.images || [];
    } catch (error) {
      console.error(`Error listing images for user ${uid}:`, error.message);
      throw error;
    }
  }

  /**
   * Process all images for a user
   * @param {string} uid - User ID
   * @param {string} subfolder - Optional subfolder within images/
   * @param {number} maxImages - Optional limit on number of images
   * @returns {Promise<object>} OCR results
   */
  async processUserImages(uid, subfolder = null, maxImages = null) {
    try {
      console.log(`🔄 Starting OCR processing for user: ${uid}`);
      
      const result = await this._executePythonOCR(uid, subfolder, maxImages, false);
      
      console.log(`✅ Completed OCR processing: ${result.num_results || 0} images`);
      return result;
    } catch (error) {
      console.error(`Error processing images for user ${uid}:`, error.message);
      throw error;
    }
  }

  /**
   * Process latest image for a user from a specific folder
   * @param {string} uid - User ID
   * @param {string} subfolder - Subfolder within images/ (e.g., "medical", "receipts")
   * @returns {Promise<object>} OCR result for latest image
   */
  async processLatestImage(uid, subfolder) {
    try {
    //   console.log(`🔄 Processing latest image for user ${uid} in folder: ${subfolder}`);
      
      // Process only 1 image (the latest)
      const result = await this._executePythonOCR(uid, subfolder, 1, false);
      
      if (result.results && result.results.length > 0) {
        console.log(`✅ Processed latest image: ${result.results[0].file_path}`);
        return result.results[0];
      } else {
        throw new Error("No images found to process");
      }
    } catch (error) {
    //   console.error(`Error processing latest image:`, error.message);
      throw error;
    }
  }

  /**
   * Execute Python OCR script
   * @private
   * @param {string} uid - User ID
   * @param {string} subfolder - Optional subfolder
   * @param {number} maxImages - Optional max images limit
   * @param {boolean} testMode - If true, only list images without processing
   * @returns {Promise<object>} OCR result
   */
  _executePythonOCR(uid, subfolder = null, maxImages = null, testMode = false) {
    return new Promise((resolve, reject) => {
      // Build Python command arguments
      const args = [
        this.pythonScriptPath,
        "--uid", uid,
        "--config-type", this.config.pythonConfigType,
      ];

      if (subfolder) {
        args.push("--subfolder", subfolder);
      }

      if (maxImages) {
        args.push("--max-images", String(maxImages));
      }

      if (testMode) {
        args.push("--test");
      }

      // Spawn Python process
      const pythonProcess = spawn("python3", args);

      let output = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python OCR error (stderr):", errorOutput);
          console.error("Python OCR output (stdout):", output);
          reject(new Error(`OCR processing failed with exit code ${code}: ${errorOutput || output}`));
          return;
        }

        try {
          // Parse JSON output from Python
          const result = JSON.parse(output);
          
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || "OCR processing failed"));
          }
        } catch (parseError) {
          console.error("Failed to parse OCR output:", output);
          console.error("Error output was:", errorOutput);
          reject(new Error(`Failed to parse OCR results: ${parseError.message}`));
        }
      });

      pythonProcess.on("error", (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  /**
   * Get storage path for user's images or results
   * @param {string} pathType - Type of path (images, results)
   * @param {string} uid - User ID
   * @param {string} subfolder - Optional subfolder
   * @returns {string} Storage path
   */
  getStoragePath(pathType, uid, subfolder = null) {
    return getStoragePath(pathType, uid, subfolder);
  }
}

/**
 * Quick helper function to process OCR for a user
 * @param {string} uid - User ID
 * @param {string} configType - OCR configuration type
 * @param {string} subfolder - Optional subfolder
 * @returns {Promise<object>} OCR results
 */
async function processUserOCR(uid, configType = "medicalDocuments", subfolder = null) {
  const service = new OCRService(configType);
  return await service.processUserImages(uid, subfolder);
}

module.exports = OCRService;
module.exports.processUserOCR = processUserOCR;
