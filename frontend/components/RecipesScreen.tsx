import {
  Heart,
  X,
  Clock,
  Users,
  Flame,
  Star,
  ChevronLeft,
  Refrigerator,
  ChefHat,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  Utensils,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { useState, useEffect, useCallback, use } from "react";
import { Card } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  searchRecipes,
  getRecipeInformation,
  type RecipeDetails,
} from "../src/utils/spoonacular";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

import TextToSpeech from "./TextToSpeech";

// Mock fridge ingredients
const FRIDGE_INGREDIENTS = ["chicken", "fish", "poop"];

// Ingredients the user cannot eat
const EXCLUDE_INGREDIENTS = [""];

// Cuisine filter list
const CUISINES = [
  { value: "italian", label: "Italian" },
  { value: "mexican", label: "Mexican" },
  { value: "chinese", label: "Chinese" },
  { value: "indian", label: "Indian" },
  { value: "japanese", label: "Japanese" },
  { value: "thai", label: "Thai" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "american", label: "American" },
  { value: "french", label: "French" },
  { value: "greek", label: "Greek" },
];

// Diet list
const DIETS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten free", label: "Gluten Free" },
  { value: "ketogenic", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "pescetarian", label: "Pescetarian" },
  { value: "whole30", label: "Whole30" },
];

// Filter type
interface RecipeFilters {
  cuisine: string;
  diet: string;
  includeIngredients: string[];
  excludeIngredients: string[];
}

export default function App() {
  const [recipeList, setRecipeList] = useState<RecipeDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(
    null
  );
  const [loadingRecipeDetails, setLoadingRecipeDetails] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Set<number>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  // test
  const [selectedRecipeSteps, setSelectedRecipeSteps] = useState<string>("");

  const [filters, setFilters] = useState<RecipeFilters>({
    includeIngredients: [...FRIDGE_INGREDIENTS],
    excludeIngredients: [...EXCLUDE_INGREDIENTS],
    cuisine: "",
    diet: "",
  });

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

  // Memoized fetch function to prevent infinite loops
  const handleGetRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching recipes with filters:", {
        ingredients: filters.includeIngredients,
        excluded: filters.excludeIngredients,
        cuisine: filters.cuisine,
        diet: filters.diet,
      });

      const recipes = await searchRecipes(
        filters.includeIngredients,
        filters.excludeIngredients,
        filters.cuisine || undefined,
        filters.diet || undefined,
        10
      );

      console.log("Fetched recipes:", recipes.length, recipes);

      if (recipes.length === 0) {
        setError(
          "No recipes found with these ingredients. Try different ones!"
        );
      }

      setRecipeList(recipes);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch recipes";
      console.error("Error fetching recipes:", err);
      setError(message);
      setRecipeList([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch recipes on mount
  useEffect(() => {
    handleGetRecipes();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (recipeList.length > 0) {
      handleGetRecipes();
    }
  }, [filters.cuisine, filters.diet]);

  const updateFilter = (key: keyof RecipeFilters, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      cuisine: "",
      diet: "",
    }));
  };

  const hasActiveFilters = filters.cuisine || filters.diet;

  const toggleSaveRecipe = (id: number) => {
    const updated = new Set(savedRecipes);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSavedRecipes(updated);
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
    setIsRecipeModalOpen(true);

    try {
      // Fetch full recipe details
      const fullRecipe = await getRecipeInformation(recipe.id);
      if (fullRecipe) {
        setSelectedRecipe(fullRecipe);
      } else {
        setSelectedRecipe(recipe);
      }
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      setSelectedRecipe(recipe);
    } finally {
      setLoadingRecipeDetails(false);
    }
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setTimeout(() => setSelectedRecipe(null), 300);
  };

  // ------------------- Render -------------------
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20 overflow-y-auto">
      {/* Mobile-Optimized Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 md:px-6 md:py-6">
          {" "}
          {/* croll */}
          <div className="flex items-start justify-between mb-4 md:mb-6">
            <div className="flex-1">
              <p className="text-gray-500 text-xs md:text-sm mb-1 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                {getCurrentTime()}, Chef!
              </p>
              <h1 className="text-gray-900 mb-1">Recipes from Your Fridge</h1>
              <p className="text-gray-600 text-sm">
                {filters.includeIngredients.length} ingredients ready
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
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
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hidden">
              <div className="flex gap-2 pb-2">
                {filters.includeIngredients.map((ingredient, index) => (
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
          </div>
          {/* Filter Button */}
          <div className="flex items-center gap-2">
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-initial rounded-full border-gray-200 bg-white gap-2 relative"
                >
                  <SlidersHorizontal size={16} />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-violet-600 text-white p-0 flex items-center justify-center text-xs">
                      {[filters.cuisine, filters.diet].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-t-3xl px-6 pb-8">
                <DialogHeader className="px-0">
                  <DialogTitle>Filter Recipes</DialogTitle>
                  <DialogDescription>
                    Customize your recipe search preferences
                  </DialogDescription>
                </DialogHeader>

                <div className="w-full h-full mt-8 space-y-8 px-1">
                  {/* Cuisine Filter */}
                  <div>
                    <label className="text-sm mb-4 block text-gray-700">
                      Cuisine Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CUISINES.map((cuisine) => (
                        <Button
                          key={cuisine.value}
                          variant={
                            filters.cuisine === cuisine.value
                              ? "default"
                              : "outline"
                          }
                          className={`rounded-full h-11 ${
                            filters.cuisine === cuisine.value
                              ? "bg-gradient-to-r from-violet-600 to-purple-600"
                              : ""
                          }`}
                          onClick={() => updateFilter("cuisine", cuisine.value)}
                        >
                          {cuisine.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Diet Filter */}
                  <div>
                    <label className="text-sm mb-4 block text-gray-700">
                      Dietary Preferences
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {DIETS.map((diet) => (
                        <Button
                          key={diet.value}
                          variant={
                            filters.diet === diet.value ? "default" : "outline"
                          }
                          className={`rounded-full h-11 ${
                            filters.diet === diet.value
                              ? "bg-gradient-to-r from-violet-600 to-purple-600"
                              : ""
                          }`}
                          onClick={() => updateFilter("diet", diet.value)}
                        >
                          {diet.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 pb-2">
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex-1 rounded-full h-12"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      onClick={() => setIsFilterOpen(false)}
                      className="flex-1 rounded-full h-12 bg-gradient-to-r from-violet-600 to-purple-600"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
            {recipeList.map((recipe) => (
              <Card
                key={recipe.id}
                className="group overflow-hidden bg-white active:scale-[0.98] transition-all duration-300 border-0 shadow-md cursor-pointer rounded-2xl hover:shadow-lg"
                onClick={() => handleRecipeClick(recipe)}
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
        ) : (
          <Card className="p-16 text-center bg-white border-0 shadow-sm rounded-3xl">
            <h3 className="text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Try adjusting your ingredients or filters
            </p>
            <Button
              onClick={() => handleGetRecipes()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full px-8 py-6 shadow-lg"
            >
              Try Again
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

                {/* Close Button */}
                {/* <button
                  onClick={closeRecipeModal}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all size-6"
                >
                  <X size={20} className="text-gray-900" />
                </button> */}

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
                          (ingredient, index) => (
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
