import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Camera,
  BookOpen,
  Heart,
  ShoppingCart,
  TrendingUp,
  Activity,
  Apple,
  Droplet,
} from "lucide-react";

export function HealthDashboard() {
  const healthMetrics = [
    {
      label: "Blood Sugar",
      value: "98 mg/dL",
      status: "normal",
      icon: <Droplet className="w-5 h-5" />,
    },
    {
      label: "Blood Pressure",
      value: "118/76",
      status: "good",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      label: "Weekly Steps",
      value: "42,387",
      status: "good",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: "Nutrition Score",
      value: "85/100",
      status: "good",
      icon: <Apple className="w-5 h-5" />,
    },
  ];

  const quickActions = [
    {
      title: "Scan Fridge",
      icon: <Camera className="w-6 h-6" />,
      color: "bg-emerald-500",
      description: "Add groceries",
    },
    {
      title: "View Meals",
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-orange-500",
      description: "Get recipes",
    },
    {
      title: "Health Plan",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-rose-500",
      description: "View guidance",
    },
    {
      title: "Groceries",
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "bg-blue-500",
      description: "Shopping list",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 pb-20">
        <div className="max-w-md mx-auto">
          <p className="opacity-90">Good morning,</p>
          <h1 className="mt-1 text-white">Sarah</h1>
          <p className="mt-2 opacity-90">You're doing great this week! 🎉</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-12">
        {/* Health Metrics */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2>Today's Health</h2>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              All Good
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {healthMetrics.map((metric, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  {metric.icon}
                  <span className="text-sm">{metric.label}</span>
                </div>
                <p className="mt-1">{metric.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <Card
                key={idx}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div
                  className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3`}
                >
                  {action.icon}
                </div>
                <h3>{action.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mb-6">
          <h2 className="mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p>Receipt scanned</p>
                <p className="text-sm text-gray-600">
                  32 items from Whole Foods
                </p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p>New recipes available</p>
                <p className="text-sm text-gray-600">
                  12 meals based on your groceries
                </p>
                <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Weekly Progress */}
        <Card className="p-6 mb-6">
          <h2 className="mb-4">Weekly Wellness</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Healthy Meals</span>
                <span className="text-sm">18/21</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: "86%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Meal Prep Days</span>
                <span className="text-sm">5/7</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "71%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Health Goals</span>
                <span className="text-sm">7/8</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: "88%" }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
