import {
  Heart,
  Clock,
  Users,
  Star,
  Refrigerator,
  ChefHat,
  Sparkles,
  Utensils,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  findRecipesByIngredients,
  type RecipeDetails,
  getRecipeInformationBulk,
} from "../src/utils/spoonacular";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { getCategorization } from "../src/utils/healthPlanService";
import { auth } from "../firebaseConfig";

import { uploadBookmarkedRecipe } from "../src/utils/uploadService";

import TextToSpeech from "./TextToSpeech";

import { uploadSavedRecipe } from "../src/utils/uploadService";
import { updateDailyNutritionTotals } from "../src/utils/dailyNutrition";

// INGREDIENTS the user cannot eat
export default function RecipesScreen({
  onNavigate,
}: {
  onNavigate?: (screen: string) => void;
}) {
  const [recipeList, setRecipeList] = useState<RecipeDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(
    null
  );
  const [loadingRecipeDetails, setLoadingRecipeDetails] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Set<number>>(new Set());
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedRecipeSteps, setSelectedRecipeSteps] = useState<string>("");
  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  // Fetch categorization data on mount
  useEffect(() => {
    console.log(
      "🔍 RecipesScreen: useEffect triggered - starting to fetch categorization data"
    );

    const fetchCategorizationData = async () => {
      console.log("📊 RecipesScreen: Setting loadingIngredients to true");
      setLoadingIngredients(true);

      try {
        console.log("👤 RecipesScreen: Checking current user from auth");
        const user = auth.currentUser;
        console.log(
          "👤 RecipesScreen: Current user:",
          user ? `UID: ${user.uid}` : "No user signed in"
        );

        if (!user) {
          console.error("❌ RecipesScreen: No user signed in");
          setError("Please sign in to view recipes");
          setLoadingIngredients(false);
          return;
        }

        console.log(
          "💾 RecipesScreen: Attempting to get cached categorization data"
        );
        // Try to get cached categorization data
        const cachedData = getCategorization();
        console.log("💾 RecipesScreen: Cached data result:", cachedData);

        if (cachedData) {
          console.log("✅ RecipesScreen: Found cached data:", {
            include: cachedData.include,
            exclude: cachedData.exclude,
            timestamp: cachedData.timestamp,
          });

          setIncludeIngredients(cachedData.include || []);
          setExcludeIngredients(cachedData.exclude || []);

          console.log("✅ RecipesScreen: Successfully set ingredients:", {
            includeCount: (cachedData.include || []).length,
            excludeCount: (cachedData.exclude || []).length,
          });
        } else {
          console.warn("⚠️ RecipesScreen: No cached categorization data found");
          setError(
            "No health plan data found. Please complete your health profile setup first."
          );
        }
      } catch (err) {
        console.error(
          "❌ RecipesScreen: Error loading categorization data:",
          err
        );
        setError("Failed to load ingredient preferences");
      } finally {
        console.log("🏁 RecipesScreen: Setting loadingIngredients to false");
        setLoadingIngredients(false);
      }
    };

    fetchCategorizationData();
  }, []);

  const uid = auth.currentUser?.uid;

  const getRecipeSteps = (recipe: RecipeDetails) => {
    if (
      recipe.analyzedInstructions &&
      recipe.analyzedInstructions.length > 0 &&
      recipe.analyzedInstructions[0].steps
    ) {
      const stepsString = recipe.analyzedInstructions[0].steps
        .map((step, index) => `Step ${index + 1}: ${step.step}`)
        .join(" ");
      setSelectedRecipeSteps(stepsString);
    } else {
      setSelectedRecipeSteps("No instructions available.");
    }
  };

  const handleGetRecipes = async () => {
    console.log("🔍 RecipesScreen: handleGetRecipes called");
    console.log("📝 RecipesScreen: Include ingredients:", includeIngredients);
    console.log("📝 RecipesScreen: Exclude ingredients:", excludeIngredients);

    if (includeIngredients.length === 0) {
      console.error("❌ RecipesScreen: No include ingredients available");
      setError(
        "No ingredients available. Please complete your health profile setup first."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "🔎 RecipesScreen: Searching recipes with ingredients:",
        includeIngredients
      );
      // Get recipes matching fridge ingredients
      const good_recipes = await findRecipesByIngredients(
        includeIngredients,
        10,
        1,
        true
      );
      console.log("✅ RecipesScreen: Found recipes:", good_recipes.length);

      const good_ids = good_recipes.map((r) => r.id);
      console.log("📋 RecipesScreen: Recipe IDs:", good_ids);

      // Bulk fetch full info
      console.log("📊 RecipesScreen: Fetching bulk recipe information");
      const full_info = await getRecipeInformationBulk(good_ids, true);
      console.log(
        "✅ RecipesScreen: Retrieved full info for",
        full_info.length,
        "recipes"
      );

      // Lowercase the excluded ingredients
      const loweredBad = excludeIngredients.map((b) => b.toLowerCase());
      console.log(
        "🚫 RecipesScreen: Lowercased excluded ingredients:",
        loweredBad
      );

      // Filter recipes that do not contain any excluded ingredient
      const valid_recipes = full_info.filter((recipe: any) => {
        if (!recipe.extendedIngredients) return true;

        const ingredients = recipe.extendedIngredients
          .map((i: any) => i.name.toLowerCase())
          .filter(Boolean);

        // Use substring match for multi-word ingredients
        const hasBadIngredient = ingredients.some((ing: string) =>
          loweredBad.some((bad) => ing.includes(bad))
        );

        return !hasBadIngredient;
      });

      console.log(
        "✅ RecipesScreen: Valid recipes after filtering:",
        valid_recipes.length
      );
      setRecipeList(valid_recipes);
      console.log("📋 RecipesScreen: Final recipe list:", valid_recipes);
    } catch (err) {
      console.error("❌ RecipesScreen: Error fetching recipes:", err);
      setError("Failed to fetch recipes. Please try again.");
      setRecipeList([]);
    } finally {
      console.log("🏁 RecipesScreen: Setting loading to false");
      setLoading(false);
    }
  };

  // const clearFilters = () => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     cuisine: "",
  //     diet: "",
  //   }));
  // };

  // const hasActiveFilters = filters.cuisine || filters.diet;

  const uploadSavedRecipesSet = async (recipesSet: Set<number>) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user logged in — cannot upload saved recipes.");
      return;
    }

    const recipesData = {
      savedRecipeIds: Array.from(recipesSet),
      updatedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(recipesData, null, 2);
    const file = new File(
      [new Blob([jsonString], { type: "application/json" })],
      "savedRecipes.json",
      { type: "application/json" }
    );

    uploadBookmarkedRecipe(
      file,
      user.uid,
      (data) => {
        console.log("Saved recipes uploaded:", data);
      },
      (error) => {
        console.error("Error uploading saved recipes:", error);
      }
    );
  };

  const toggleSaveRecipe = (id: number) => {
    const updated = new Set(savedRecipes);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSavedRecipes(updated);
    // Upload the updated set to Firebase
    uploadSavedRecipesSet(updated);
  };

  useEffect(() => {
    if (selectedRecipe) {
      getRecipeSteps(selectedRecipe);
    }
  }, [selectedRecipe]);

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleRecipeClick = async (recipe: RecipeDetails) => {
    setLoadingRecipeDetails(true);
    setSelectedRecipe(recipe);
    setLoadingRecipeDetails(false);
  };

  const saveRecipeToDatabase = async (recipe: RecipeDetails) => {
    try {
      if (!uid) {
        console.warn("User not logged in — cannot save recipe");
        return;
      }

      const jsonString = JSON.stringify(recipe, null, 2);
      const timestamp = Date.now();

      const file = new File([jsonString], `${timestamp}-${recipe.id}.json`, {
        type: "application/json",
      });

      await uploadSavedRecipe(file, uid, () => {
        console.log("Recipe saved!");
      });

      await updateDailyNutritionTotals(uid);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  // ------------------- Render -------------------

  // Show loading state while fetching ingredients
  if (loadingIngredients) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin text-violet-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading your personalized recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20 overflow-y-auto">
      {/* Mobile-Optimized Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 pt-4 md:px-6 md:py-6">
          {" "}
          {/* Scroll */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex-1">
              <p className="text-gray-500 text-xs md:text-sm mb-1 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                {getCurrentTime()}, Chef!
              </p>
              <h1 className="text-gray-900 mb-1">Recipes from Your Fridge</h1>
              <p className="text-gray-600 text-sm">
                {includeIngredients.length} ingredients ready
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.("meal-prep")}
              className="rounded-full border-gray-200 hover:bg-gray-50 gap-1.5 h-9 md:h-10"
            >
              <Refrigerator size={16} />
              <span className="hidden sm:inline">Fridge</span>
            </Button>
          </div>
          {/* Fridge Ingredients Preview */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat size={14} className="text-gray-600" />
              <span className="text-xs text-gray-600">
                Available Ingredients
              </span>
            </div>
            {includeIngredients.length > 0 ? (
              <div className="overflow-x-auto -mx-4 px-4 scrollbar-hidden">
                <div className="flex gap-2 pb-2">
                  {includeIngredients.map((ingredient, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 border rounded-full px-3 py-1 text-xs whitespace-nowrap flex-shrink-0"
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No ingredients available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="px-4 md:px-6 py-4 md:py-6">
        {error && (
          <Card className="p-4 mb-4 bg-red-50 border-red-200 text-red-700 rounded-2xl">
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden animate-pulse rounded-2xl border-0 shadow-sm"
              >
                <div className="h-56 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : recipeList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recipeList.map((recipe, index) => (
              <Card
                key={recipe.id}
                onClick={() => {
                  handleRecipeClick(recipe);
                  setIsRecipeModalOpen(true);
                }}
                className="group overflow-hidden bg-white active:scale-[0.98] transition-all duration-300 border-0 shadow-md cursor-pointer rounded-2xl hover:shadow-lg"
              >
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveRecipe(recipe.id);
                    }}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all"
                  >
                    <Heart
                      size={20}
                      className={
                        savedRecipes.has(recipe.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-gray-900 mb-2 line-clamp-2 font-semibold">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {recipe.readyInMinutes && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{recipe.readyInMinutes} min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : includeIngredients.length === 0 ? (
          <Card className="p-16 text-center bg-white border-0 shadow-sm rounded-3xl">
            <h3 className="text-gray-900 mb-2">No ingredients available</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Please complete your health profile setup to get personalized
              recipes
            </p>
          </Card>
        ) : (
          <Card className="p-16 text-center bg-white border-0 shadow-sm rounded-3xl">
            <h3 className="text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Search by ingredients in your fridge
            </p>
            <Button
              onClick={() => handleGetRecipes()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full px-8 py-6 shadow-lg"
            >
              Search for Recipes
            </Button>
          </Card>
        )}
      </div>

      {/* Recipe Details Modal */}
      <Dialog open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {loadingRecipeDetails ? (
            <div className="p-8 space-y-4">
              <div className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
              <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ) : selectedRecipe ? (
            <div>
              {/* Hero Image */}
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-50">
                <ImageWithFallback
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Save Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveRecipe(selectedRecipe.id);
                  }}
                  className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all"
                >
                  <Heart
                    size={20}
                    className={
                      savedRecipes.has(selectedRecipe.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }
                  />
                </button>
                <TextToSpeech
                  text={selectedRecipeSteps}
                  className="text-sm absolute top-4 left-1/7 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all"
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title & Basic Info */}
                <div>
                  <h2 className="text-gray-900 mb-3">{selectedRecipe.title}</h2>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {selectedRecipe.readyInMinutes && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock size={16} />
                        <span className="text-sm">
                          {selectedRecipe.readyInMinutes} min
                        </span>
                      </div>
                    )}
                    {selectedRecipe.servings && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users size={16} />
                        <span className="text-sm">
                          {selectedRecipe.servings} servings
                        </span>
                      </div>
                    )}
                    {selectedRecipe.healthScore && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Star
                          size={16}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="text-sm">
                          Health Score: {selectedRecipe.healthScore}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Diet Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.vegetarian && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        Vegetarian
                      </Badge>
                    )}
                    {selectedRecipe.vegan && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        Vegan
                      </Badge>
                    )}
                    {selectedRecipe.glutenFree && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                        Gluten Free
                      </Badge>
                    )}
                    {selectedRecipe.dairyFree && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                        Dairy Free
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Ingredients */}
                {selectedRecipe.extendedIngredients &&
                  selectedRecipe.extendedIngredients.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ChefHat size={18} className="text-violet-600" />
                        <h3 className="text-gray-900">Ingredients</h3>
                      </div>
                      <div className="space-y-2">
                        {selectedRecipe.extendedIngredients.map(
                          (ingredient: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500 mt-0.5 flex-shrink-0"
                              />
                              <span>{ingredient.original}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Instructions */}
                {selectedRecipe.analyzedInstructions &&
                  selectedRecipe.analyzedInstructions.length > 0 &&
                  selectedRecipe.analyzedInstructions[0].steps?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Utensils size={18} className="text-violet-600" />
                        <h3 className="text-gray-900">Instructions</h3>
                      </div>
                      <ol className="space-y-3">
                        {selectedRecipe.analyzedInstructions[0].steps.map(
                          (step, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </span>
                              <span className="text-sm text-gray-700 pt-0.5">
                                {step.step}
                              </span>
                            </li>
                          )
                        )}
                      </ol>
                    </div>
                  )}

                {/* No Instructions Available */}
                {(!selectedRecipe.analyzedInstructions ||
                  selectedRecipe.analyzedInstructions.length === 0 ||
                  !selectedRecipe.analyzedInstructions[0].steps ||
                  selectedRecipe.analyzedInstructions[0].steps.length ===
                    0) && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 text-center">
                      Cooking instructions are not available for this recipe.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Cook Button */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl p-4 border-t border-gray-200">
            <Button
              className="w-full py-5 text-lg rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md active:scale-[0.98] transition"
              onClick={() => {
                if (selectedRecipe) {
                  saveRecipeToDatabase(selectedRecipe);
                }
              }}
            >
              Cook?
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
