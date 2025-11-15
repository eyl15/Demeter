import { Heart, ChevronRight, X, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { searchRecipes, type RecipeBasic } from "../src/utils/spoonacular";
import { Button } from "./ui/button";

export default function RecipesScreen() {
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [recipeList, setRecipeList] = useState<RecipeBasic[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetRecipes = async () => {
    setLoading(true);
    try {
      const recipes: RecipeBasic[] = await searchRecipes(
        "chicken salad",
        "",
        "",
        5
      );
      setRecipeList(recipes);
      console.log("Fetched recipes:", recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const [editingMeals, setEditingMeals] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  });

  // ✅ FIXED SCROLL-LOCK HANDLING
  useEffect(() => {
    if (editingDayIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editingDayIndex]);

  const [mealPlan, setMealPlan] = useState([
    {
      day: "Monday",
      breakfast: "Greek Yogurt Parfait",
      lunch: "Mediterranean Bowl",
      dinner: "Grilled Salmon",
    },
    {
      day: "Tuesday",
      breakfast: "Scrambled Eggs",
      lunch: "Chicken Salad",
      dinner: "Stir Fry",
    },
    {
      day: "Wednesday",
      breakfast: "Oatmeal",
      lunch: "Salmon Bowl",
      dinner: "Roasted Chicken",
    },
    {
      day: "Thursday",
      breakfast: "Smoothie Bowl",
      lunch: "Tuna Salad",
      dinner: "Grilled Chicken",
    },
    {
      day: "Friday",
      breakfast: "Eggs Benedict",
      lunch: "Pasta Primavera",
      dinner: "Baked Fish",
    },
    {
      day: "Saturday",
      breakfast: "Pancakes",
      lunch: "Chicken Wrap",
      dinner: "Steak and Veggies",
    },
    {
      day: "Sunday",
      breakfast: "French Toast",
      lunch: "Turkey Sandwich",
      dinner: "Lasagna",
    },
  ]);

  const handleEditDay = (dayIndex: number) => {
    setEditingMeals({
      breakfast: mealPlan[dayIndex].breakfast,
      lunch: mealPlan[dayIndex].lunch,
      dinner: mealPlan[dayIndex].dinner,
    });
    setEditingDayIndex(dayIndex);
  };

  const handleSaveMeals = () => {
    if (editingDayIndex !== null) {
      const updatedPlan = [...mealPlan];
      updatedPlan[editingDayIndex] = {
        ...updatedPlan[editingDayIndex],
        ...editingMeals,
      };
      setMealPlan(updatedPlan);
      setEditingDayIndex(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b flex-shrink-0">
        <h2 className="text-gray-900 mb-1">Your Recipes</h2>
        <p className="text-gray-600">Personalized for your health goals</p>
        <Button onClick={handleGetRecipes} disabled={loading} className="m-4">
          Apples
        </Button>
      </div>

      <Tabs
        defaultValue="recipes"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-6 my-4 grid w-auto grid-cols-2 flex-shrink-0">
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
        </TabsList>

        <TabsContent
          value="recipes"
          className="flex-1 overflow-y-auto px-4 mt-0"
        >
          <div className="mb-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex gap-3">
                <Heart
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h4 className="text-gray-900 mb-1">
                    Based on Your Groceries
                  </h4>
                  <p className="text-gray-700">
                    These recipes use items from your recent receipt scan
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-3 pb-[100px]">
            {recipeList?.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 relative">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded">
                    <Heart className="text-red-600 bg-transparent" size={28} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 mb-2">{recipe.title}</h3>

                  {/* <div className="flex items-center gap-4 mb-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{recipe.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{recipe.servings} servings</span>
                    </div>
                  </div> */}

                  {/* <div className="flex flex-wrap gap-2 mb-3">
                    {recipe.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div> */}

                  {/* <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle
                      className="text-orange-600 flex-shrink-0 mt-0.5"
                      size={16}
                    />
                    <p className="text-gray-700">{recipe.healthNote}</p>
                  </div> */}

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">View Recipe</span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="meal-plan"
          className="flex-1 overflow-y-auto px-4 mt-0"
        >
          <div className="mb-4">
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div>
                <h4 className="text-gray-900 mb-1">This Week's Plan</h4>
                <p className="text-gray-700">
                  Click edit on any day to change meals
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-3 pb-[100px]">
            {mealPlan.map((day, dayIndex) => (
              <Card key={dayIndex} className="p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-gray-900">{day.day}</h4>
                  <button
                    onClick={() => handleEditDay(dayIndex)}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Edit2 size={16} />
                    <span className="text-sm">Edit</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Breakfast</span>
                    <span className="text-gray-900">{day.breakfast}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Lunch</span>
                    <span className="text-gray-900">{day.lunch}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Dinner</span>
                    <span className="text-gray-900">{day.dinner}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Edit Modal - Centered */}
          {editingDayIndex !== null && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-auto">
              <div className="w-[calc(100%-32px)] max-w-sm bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit {mealPlan[editingDayIndex].day}
                  </h3>
                  <button
                    onClick={() => setEditingDayIndex(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Breakfast
                    </label>
                    <input
                      type="text"
                      value={editingMeals.breakfast}
                      onChange={(e) =>
                        setEditingMeals({
                          ...editingMeals,
                          breakfast: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Lunch
                    </label>
                    <input
                      type="text"
                      value={editingMeals.lunch}
                      onChange={(e) =>
                        setEditingMeals({
                          ...editingMeals,
                          lunch: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Dinner
                    </label>
                    <input
                      type="text"
                      value={editingMeals.dinner}
                      onChange={(e) =>
                        setEditingMeals({
                          ...editingMeals,
                          dinner: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingDayIndex(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMeals}
                    className="flex-1 px-4 py-2 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
