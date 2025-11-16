import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Sparkles, ChefHat } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getBookmarkedRecipe } from "../src/utils/uploadService";
import { auth } from "../firebaseConfig";
import type { RecipeDetails } from "../src/utils/spoonacular";
interface MealPrepPlanProps {
  onBack: () => void;
}

export function FavoriteRecipes({ onBack }: MealPrepPlanProps) {
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<RecipeDetails[]>(
    []
  );
  const [bookmarkedLoading, setBookmarkedLoading] = useState<boolean>(true);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setBookmarkedLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          if (mounted) setBookmarkedRecipes([]);
          return;
        }
        const recipes = await getBookmarkedRecipe(user.uid).catch((e) => {
          console.error("Failed to fetch bookmarked recipes:", e);
          return [] as RecipeDetails[];
        });
        if (mounted) setBookmarkedRecipes(recipes || []);
      } finally {
        if (mounted) setBookmarkedLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-500 text-white p-6 flex-shrink-0 sticky top-0 z-40">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-white">Your Favorite Recipes</h1>
        <p className="mt-2 opacity-95">Recipes you've saved and loved</p>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-4 md:py-6">
        {/* Saved Recipes Count */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="opacity-90 text-sm">Your Saved Recipes</p>
              <p className="mt-1 font-semibold">
                {bookmarkedRecipes.length} recipe
                {bookmarkedRecipes.length !== 1 ? "s" : ""} saved
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{bookmarkedRecipes.length}</p>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: bookmarkedRecipes.length > 0 ? "100%" : "0%" }}
            ></div>
          </div>
        </Card>

        {/* Loading State */}
        {bookmarkedLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading your favorite recipes...</p>
          </div>
        )}

        {/* Empty State */}
        {!bookmarkedLoading && bookmarkedRecipes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ChefHat className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No saved recipes yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Start bookmarking recipes to see them here
            </p>
          </div>
        )}

        {/* Recipes Grid */}
        {!bookmarkedLoading && bookmarkedRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarkedRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="group overflow-hidden bg-white active:scale-[0.98] transition-all duration-300 border-0 shadow-md cursor-pointer rounded-2xl hover:shadow-lg"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                  <ImageWithFallback
                    src={
                      recipe.image ||
                      "https://via.placeholder.com/556x370?text=No+Image"
                    }
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                </div>

                <div className="p-4">
                  <h3 className="text-gray-900 font-semibold mb-2">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {recipe.readyInMinutes && recipe.readyInMinutes > 0 && (
                      <span>⏱️ {recipe.readyInMinutes} min</span>
                    )}
                    {recipe.servings && recipe.servings > 0 && (
                      <span>🍽️ {recipe.servings} servings</span>
                    )}
                    {recipe.healthScore && recipe.healthScore > 0 && (
                      <span>💚 {recipe.healthScore}% health</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
