/**
 * Health Plan Service
 * Manages storage and retrieval of health plan data (OCR results, ingredients, categorization)
 */

const STORAGE_KEYS = {
  OCR_RESULT: 'demeter_ocr_result',
  INGREDIENTS: 'demeter_ingredients',
  CATEGORIZATION: 'demeter_categorization',
  LAST_UPDATED: 'demeter_last_updated'
};

export interface OcrResult {
  full_text: string;
  file_path: string;
  timestamp: string;
  uid?: string;
}

export interface IngredientsResult {
  Ingredients: string[];
  timestamp: string;
  uid?: string;
}

export interface HealthInsight {
  title: string;
  summary: string;
}

export interface CategorizationResult {
  include: string[];
  exclude: string[];
  healthInsights: HealthInsight[];
  nutritionTips: string;
  smartShopping: string;
  timestamp: string;
}

// ============ Storage Functions ============

export const storeOcrResult = (ocrData: OcrResult): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.OCR_RESULT, JSON.stringify(ocrData));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
  } catch (error) {
    console.error('Error storing OCR result:', error);
  }
};

export const getOcrResult = (): OcrResult | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OCR_RESULT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving OCR result:', error);
    return null;
  }
};

export const storeIngredients = (ingredientsData: IngredientsResult): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredientsData));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
  } catch (error) {
    console.error('Error storing ingredients:', error);
  }
};

export const getIngredients = (): IngredientsResult | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving ingredients:', error);
    return null;
  }
};

export const storeCategorization = (categorizationData: CategorizationResult): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIZATION, JSON.stringify(categorizationData));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
  } catch (error) {
    console.error('Error storing categorization:', error);
  }
};

export const getCategorization = (): CategorizationResult | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIZATION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving categorization:', error);
    return null;
  }
};

export const getLastUpdated = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
};

export const clearHealthPlanData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// ============ API Functions ============

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

/**
 * Process OCR for medical report
 */
export const processOcr = async (uid: string): Promise<OcrResult> => {
  const response = await fetch(`${API_BASE_URL}/api/process-ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid })
  });

  if (!response.ok) {
    throw new Error(`OCR processing failed: ${response.statusText}`);
  }

  const result = await response.json();
  const ocrData: OcrResult = {
    ...result,
    timestamp: new Date().toISOString(),
    uid
  };

  storeOcrResult(ocrData);
  return ocrData;
};

/**
 * Analyze fridge for ingredients
 */
export const analyzeFridge = async (uid: string): Promise<IngredientsResult> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze-fridge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid })
  });

  if (!response.ok) {
    throw new Error(`Fridge analysis failed: ${response.statusText}`);
  }

  const result = await response.json();
  const ingredientsData: IngredientsResult = {
    ...result,
    timestamp: new Date().toISOString(),
    uid
  };

  storeIngredients(ingredientsData);
  return ingredientsData;
};

/**
 * Get categorized ingredients and health insights
 * Automatically uses stored OCR and ingredients data if available
 */
export const getHealthPlan = async (uid: string, forceRefresh = false): Promise<CategorizationResult> => {
  // Check if we have cached data and it's recent (less than 24 hours old)
  if (!forceRefresh) {
    const cached = getCategorization();
    const lastUpdated = getLastUpdated();
    
    if (cached && lastUpdated) {
      const hoursSinceUpdate = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 24) {
        return cached;
      }
    }
  }

  // Get or fetch OCR result
  let ocrResult = getOcrResult();
  if (!ocrResult || ocrResult.uid !== uid || forceRefresh) {
    ocrResult = await processOcr(uid);
  }

  // Get or fetch ingredients
  let ingredientsResult = getIngredients();
  if (!ingredientsResult || ingredientsResult.uid !== uid || forceRefresh) {
    ingredientsResult = await analyzeFridge(uid);
  }

  // Call categorize-ingredients API
  const response = await fetch(`${API_BASE_URL}/api/categorize-ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      medicalReportText: ocrResult.full_text,
      ingredients: ingredientsResult.Ingredients,
      uid
    })
  });

  if (!response.ok) {
    throw new Error(`Categorization failed: ${response.statusText}`);
  }

  const result = await response.json();
  const categorizationData: CategorizationResult = {
    ...result,
    timestamp: new Date().toISOString()
  };

  storeCategorization(categorizationData);
  return categorizationData;
};

/**
 * Refresh health plan data
 * Forces fresh API calls for OCR, ingredients, and categorization
 */
export const refreshHealthPlan = async (uid: string): Promise<CategorizationResult> => {
  return getHealthPlan(uid, true);
};
