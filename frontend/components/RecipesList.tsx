import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Clock,
  Users,
  Heart,
  ShieldCheck,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { RecipeDetail } from "./RecipeDetail";
import { MealPrepPlan } from "./MealPrepPlan";

export function RecipesList() {
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const [showMealPlan, setShowMealPlan] = useState(false);

  const recipes = [
    {
      id: 1,
      name: "Grilled Salmon with Roasted Sweet Potatoes",
      image:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      time: "35 min",
      servings: 2,
      healthBenefits: ["Heart Healthy", "Low Sodium"],
      matchScore: 95,
      ingredients: ["Salmon Fillet", "Sweet Potatoes", "Olive Oil"],
      calories: 420,
      protein: "34g",
      carbs: "28g",
      fat: "18g",
    },
    {
      id: 2,
      name: "Greek Yogurt Berry Parfait",
      image:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
      time: "10 min",
      servings: 1,
      healthBenefits: ["High Protein", "Low Sugar"],
      matchScore: 92,
      ingredients: ["Greek Yogurt", "Blueberries"],
      calories: 280,
      protein: "20g",
      carbs: "35g",
      fat: "6g",
    },
    {
      id: 3,
      name: "Spinach & Chicken Brown Rice Bowl",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      time: "30 min",
      servings: 2,
      healthBenefits: ["Diabetic Friendly", "High Fiber"],
      matchScore: 90,
      ingredients: ["Chicken Breast", "Organic Spinach", "Brown Rice"],
      calories: 385,
      protein: "32g",
      carbs: "42g",
      fat: "9g",
    },
    {
      id: 4,
      name: "Mediterranean Chicken Salad",
      image:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
      time: "20 min",
      servings: 2,
      healthBenefits: ["Low Cholesterol", "Heart Healthy"],
      matchScore: 88,
      ingredients: ["Chicken Breast", "Organic Spinach", "Olive Oil"],
      calories: 310,
      protein: "28g",
      carbs: "15g",
      fat: "16g",
    },
  ];

  if (showMealPlan) {
    return <MealPrepPlan onBack={() => setShowMealPlan(false)} />;
  }

  if (selectedRecipe !== null) {
    const recipe = recipes.find((r) => r.id === selectedRecipe);
    if (recipe) {
      return (
        <RecipeDetail recipe={recipe} onBack={() => setSelectedRecipe(null)} />
      );
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-br from-orange-500 to-rose-500 text-white p-6 flex-shrink-0">
        <h1 className="text-white">Recipes For You</h1>
        <p className="mt-2 opacity-90">Based on your recent groceries</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-6 py-6">
          <Card className="p-6 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="opacity-90">This Week's Meal Plan</p>
                <p className="mt-1">7 meals ready to prep</p>
              </div>
              <Button
                onClick={() => setShowMealPlan(true)}
                variant="secondary"
                size="sm"
              >
                <Calendar className="mr-2 w-4 h-4" />
                View Plan
              </Button>
            </div>
          </Card>

          <div className="mb-6">
            <h2 className="mb-4">Personalized Suggestions</h2>
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedRecipe(recipe.id)}
                >
                  <div className="relative">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500 border-0">
                        {recipe.matchScore}% Match
                      </Badge>
                    </div>
                    <button className="absolute top-3 left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="mb-3">{recipe.name}</h3>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {recipe.healthBenefits.map((benefit, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {benefit}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Calories:</span>{" "}
                          <span>{recipe.calories}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Protein:</span>{" "}
                          <span>{recipe.protein}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-6 bg-purple-50 border-purple-200 mb-6">
            <h3 className="text-purple-900 mb-2">Need More Ingredients?</h3>
            <p className="text-sm text-purple-700 mb-4">
              We can suggest recipes based on items you already have at home.
            </p>
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              View Pantry Recipes
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
