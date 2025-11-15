import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, Calendar, CheckCircle2, Clock } from "lucide-react";

interface MealPrepPlanProps {
  onBack: () => void;
}

export function MealPrepPlan({ onBack }: MealPrepPlanProps) {
  const weekPlan = [
    {
      day: "Monday",
      date: "Nov 18",
      meals: [
        {
          type: "Breakfast",
          name: "Greek Yogurt Berry Parfait",
          time: "8:00 AM",
          completed: true,
        },
        {
          type: "Lunch",
          name: "Mediterranean Chicken Salad",
          time: "12:30 PM",
          completed: true,
        },
        {
          type: "Dinner",
          name: "Grilled Salmon with Sweet Potatoes",
          time: "7:00 PM",
          completed: false,
        },
      ],
    },
    {
      day: "Tuesday",
      date: "Nov 19",
      meals: [
        {
          type: "Breakfast",
          name: "Spinach Omelette",
          time: "8:00 AM",
          completed: false,
        },
        {
          type: "Lunch",
          name: "Chicken Brown Rice Bowl",
          time: "12:30 PM",
          completed: false,
        },
        {
          type: "Dinner",
          name: "Baked Salmon with Vegetables",
          time: "7:00 PM",
          completed: false,
        },
      ],
    },
    {
      day: "Wednesday",
      date: "Nov 20",
      meals: [
        {
          type: "Breakfast",
          name: "Berry Smoothie Bowl",
          time: "8:00 AM",
          completed: false,
        },
        {
          type: "Lunch",
          name: "Grilled Chicken Wrap",
          time: "12:30 PM",
          completed: false,
        },
        {
          type: "Dinner",
          name: "Spinach & Chicken Stir Fry",
          time: "7:00 PM",
          completed: false,
        },
      ],
    },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-br from-orange-500 to-rose-500 text-white p-6 flex-shrink-0">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-white">This Week's Meal Plan</h1>
        <p className="mt-2 opacity-90">Your personalized weekly menu</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-6 py-6">
          <Card className="p-6 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="opacity-90">Week Progress</p>
                <p className="mt-1">2 of 21 meals completed</p>
              </div>
              <div className="text-right">
                <p>9%</p>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: "9%" }}
              ></div>
            </div>
          </Card>

          <div className="space-y-6 ">
            {weekPlan.map((dayPlan, dayIdx) => (
              <div key={dayIdx}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <h2>{dayPlan.day}</h2>
                    <p className="text-sm text-gray-600">{dayPlan.date}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {dayPlan.meals.map((meal, mealIdx) => (
                    <Card
                      key={mealIdx}
                      className={`p-4 ${
                        meal.completed ? "bg-green-50 border-green-200" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                meal.type === "Breakfast"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : meal.type === "Lunch"
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                            >
                              {meal.type}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {meal.time}
                            </div>
                          </div>
                          <p className={meal.completed ? "text-green-900" : ""}>
                            {meal.name}
                          </p>
                        </div>
                        {meal.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <button className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 hover:border-emerald-500 transition-colors" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
            <h3 className="text-blue-900 mb-2">Prep Tips</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Batch cook chicken breasts on Sunday</li>
              <li>• Pre-cut vegetables and store in containers</li>
              <li>• Prepare overnight oats for quick breakfasts</li>
              <li>• Cook brown rice in bulk for the week</li>
            </ul>
          </Card>

          <div className="space-y-3 mt-6 pb-6">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
              Generate Shopping List
            </Button>
            <Button variant="outline" className="w-full">
              Customize This Week
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
