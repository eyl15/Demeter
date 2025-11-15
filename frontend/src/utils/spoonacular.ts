// src/utils/spoonacular.ts
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
if (!API_KEY) console.warn("VITE_SPOONACULAR_API_KEY is not set");

export interface RecipeBasic {
  id: number;
  title: string;
  image?: string;
}

export interface RecipeIngredient extends RecipeBasic {
  usedIngredients?: { original: string }[];
  missedIngredients?: { original: string }[];
  usedIngredientCount?: number;
  missedIngredientCount?: number;
}

export interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: { original: string }[];
  analyzedInstructions: { steps: { step: string }[] }[];
}

export async function searchRecipes(
  query: string,
  diet?: string,
  cuisine?: string,
  number: number = 5
): Promise<RecipeBasic[]> {
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
    query
  )}${diet ? `&diet=${encodeURIComponent(diet)}` : ""}${
    cuisine ? `&cuisine=${encodeURIComponent(cuisine)}` : ""
  }&number=${number}&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Spoonacular API error: ${res.status}`);
    const data = await res.json();
    return data.results ?? [];
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

export async function searchByIngredients(
  ingredients: string,
  number: number = 6
): Promise<RecipeIngredient[]> {
  const sanitized = ingredients
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, ",")
    .replace(/,+/g, ",");

  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
    sanitized
  )}&number=${number}&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Spoonacular API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching recipes by ingredients:", error);
    return [];
  }
}

export async function getRecipeInformation(
  id: number
): Promise<RecipeDetails | null> {
  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Spoonacular API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching recipe details for ID ${id}:`, error);
    return null;
  }
}
