import {
  Camera,
  BookOpen,
  Activity,
  ShoppingCart,
  Heart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card } from "./ui/card";
import { motion } from "framer-motion";

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const quickActions = [
    {
      id: "scan",
      icon: Camera,
      label: "Scan Fridge",
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "recipes",
      icon: BookOpen,
      label: "View Recipes",
      color: "green",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "health-plan",
      icon: Heart,
      label: "Health Plan",
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "groceries",
      icon: ShoppingCart,
      label: "Groceries",
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white">Home</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white">SJ</span>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 -mt-4 scroll-smooth">
        {/* Health Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-4 mb-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Today's Summary</h3>
              <Activity className="text-blue-600" size={20} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="text-gray-500 mb-1">Calories</div>
                <div className="text-gray-900">1,420</div>
                <div className="text-green-600">/ 1,800</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="text-gray-500 mb-1">Sodium</div>
                <div className="text-gray-900">1,240mg</div>
                <div className="text-orange-600">/ 1,500mg</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="text-gray-500 mb-1">Water</div>
                <div className="text-gray-900">6 cups</div>
                <div className="text-blue-600">/ 8 cups</div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Health Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4 mb-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-md">
            <div className="flex gap-3">
              <AlertCircle
                className="text-orange-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h4 className="text-gray-900 mb-1">Health Reminder</h4>
                <p className="text-gray-700">
                  Your sodium intake is high. Consider low-sodium recipes for
                  dinner.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-4">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-900 mb-3 px-2"
          >
            Quick Actions
          </motion.h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    onClick={() =>
                      action.id !== "groceries" && onNavigate(action.id)
                    }
                    className="p-4 bg-white hover:shadow-xl cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-gray-100"
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <motion.div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="text-white" size={24} />
                      </motion.div>
                      <div className="text-gray-900">{action.label}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="p-4 mb-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Weekly Progress</h3>
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Healthy Meals</span>
                  <span className="text-gray-900">12/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Daily Streak</span>
                  <span className="text-gray-900">7 days 🔥</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
