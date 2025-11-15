import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Clock,
  Users,
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Recipe {
  id: number;
  name: string;
  image: string;
  time: string;
  servings: number;
  healthBenefits: string[];
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: string[];
}

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

export function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
  const steps = [
    "Preheat oven to 400°F (200°C). Line a baking sheet with parchment paper.",
    "Cut sweet potatoes into 1-inch cubes. Toss with 1 tbsp olive oil, salt, and pepper.",
    "Spread sweet potatoes on the baking sheet and roast for 25-30 minutes.",
    "Meanwhile, season salmon fillets with remaining olive oil, lemon juice, and herbs.",
    "Heat a skillet over medium-high heat. Place salmon skin-side down.",
    "Cook for 4-5 minutes per side until salmon is cooked through and flakes easily.",
    "Serve salmon over roasted sweet potatoes. Garnish with fresh herbs.",
  ];

  const fullIngredients = [
    { name: "Salmon Fillet", amount: "1.5 lbs", owned: true },
    { name: "Sweet Potatoes", amount: "2 large", owned: true },
    { name: "Olive Oil", amount: "2 tbsp", owned: true },
    { name: "Lemon", amount: "1", owned: false },
    { name: "Fresh Dill", amount: "2 tbsp", owned: false },
    { name: "Salt & Pepper", amount: "to taste", owned: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-64 object-cover"
        />
        <Button
          onClick={onBack}
          variant="secondary"
          size="sm"
          className="absolute top-4 left-4"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="mb-3">{recipe.name}</h1>

          <div className="flex items-center gap-4 mb-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{recipe.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
        </div>

        <Card className="p-6 mb-6">
          <h2 className="mb-4">Nutrition Facts</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Calories</p>
              <p>{recipe.calories}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Protein</p>
              <p>{recipe.protein}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Carbs</p>
              <p>{recipe.carbs}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Fat</p>
              <p>{recipe.fat}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-green-900 mb-2">Health Note</h3>
              <p className="text-sm text-green-700">
                This recipe is specially designed for managing blood pressure.
                It's low in sodium (under 300mg per serving) and rich in omega-3
                fatty acids and potassium, which support cardiovascular health.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="mb-4">Ingredients</h2>
          <div className="space-y-3">
            {fullIngredients.map((ingredient, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ingredient.owned ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={ingredient.owned ? "" : "text-gray-500"}>
                    {ingredient.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {ingredient.amount}
                </span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Add Missing Items to Shopping List
          </Button>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="mb-4">Preparation Steps</h2>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="pt-1">{step}</p>
              </div>
            ))}
          </div>
        </Card> 

        <div className="space-y-3 pb-[100px]">
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
            Add to Meal Plan
          </Button>
          <Button variant="outline" className="w-full">
            Share Recipe
          </Button>
        </div>
      </div>
    </div>
  );
}
