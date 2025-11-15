import {
  Heart,
  Target,
  TrendingUp,
  Award,
  ShoppingBag,
  Utensils,
  Activity,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export default function HealthPlanScreen() {
  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-8 text-white">
        <h2 className="text-white mb-1">Your Health Plan</h2>
        <p className="text-purple-100">
          Personalized recommendations for better health
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 -mt-4">
        {/* Current Goals */}
        <Card className="p-4 mb-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Current Goals</h3>
            <Target className="text-purple-600" size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Reduce Sodium Intake</span>
                <span className="text-purple-600">75%</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-gray-600 mt-1">Target: under 1,500mg daily</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Increase Omega-3</span>
                <span className="text-purple-600">60%</span>
              </div>
              <Progress value={60} className="h-2" />
              <p className="text-gray-600 mt-1">2-3 servings of fish weekly</p>
            </div>
          </div>
        </Card>

        {/* Health Insights */}
        <Card className="p-4 mb-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Health Insights</h3>
            <Heart className="text-red-600" size={20} />
          </div>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
              <Activity
                className="text-green-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h4 className="text-gray-900 mb-1">
                  Blood Pressure Management
                </h4>
                <p className="text-gray-700">
                  Your low-sodium choices this week have been excellent. Keep it
                  up!
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp
                className="text-blue-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h4 className="text-gray-900 mb-1">Cholesterol Improvement</h4>
                <p className="text-gray-700">
                  Adding more fiber and omega-3 rich foods shows positive
                  trends.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations */}
        <div className="mb-4">
          <h3 className="text-gray-900 mb-3 px-2">
            Personalized Recommendations
          </h3>
          <div className="space-y-3">
            {/* Nutrition */}
            <Card className="p-4 bg-white">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Utensils className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-gray-900">Nutrition Tips</h4>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700"
                    >
                      New
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2">
                    Try adding more leafy greens to your meals for better blood
                    sugar control
                  </p>
                  <button className="text-orange-600">Learn More →</button>
                </div>
              </div>
            </Card>

            {/* Grocery */}
            <Card className="p-4 bg-white">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">Smart Shopping</h4>
                  <p className="text-gray-700 mb-2">
                    Look for "No Salt Added" labels when buying canned
                    vegetables
                  </p>
                  <button className="text-blue-600">View Tips →</button>
                </div>
              </div>
            </Card>

            {/* Lifestyle */}
            <Card className="p-4 bg-white">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 mb-1">Lifestyle Habits</h4>
                  <p className="text-gray-700 mb-2">
                    Consider meal prepping on Sundays to maintain consistent
                    healthy eating
                  </p>
                  <button className="text-green-600">Get Started →</button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Streak & Achievements */}
        <Card className="p-4 mb-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Your Achievements</h3>
            <Award className="text-yellow-600" size={20} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-gray-900">7 Days</div>
              <div className="text-gray-600">Streak</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="text-2xl">🥗</span>
              </div>
              <div className="text-gray-900">24 Meals</div>
              <div className="text-gray-600">Tracked</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-sm">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-gray-900">5 Goals</div>
              <div className="text-gray-600">Reached</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
