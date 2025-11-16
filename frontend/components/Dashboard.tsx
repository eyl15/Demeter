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
import { useState, useEffect } from "react";
import {
  calculateCalories,
  calculateSodium,
  calculateSugarLimit,
} from "../src/utils/dailyNutrition";
import type {
  PersonalInfo,
  Conditions,
  Dietary,
} from "../src/utils/dailyNutrition";
import { db } from "../firebaseConfig";
import { collection, doc, getDoc } from "firebase/firestore";

interface HealthProfile {
  uid: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    age: string;
    height: string;
    weight: string;
    sex: string;
  };
  conditions: {
    diabetes: boolean;
    highBP: boolean;
    highCholesterol: boolean;
  };
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    lowSodium: boolean;
    lowCarb: boolean;
  };
}

interface DashboardProps {
  onNavigate: (screen: string) => void;
  healthProfile: HealthProfile | null;
}

export default function Dashboard({
  onNavigate,
  healthProfile,
}: DashboardProps) {
  const quickActions = [
    {
      id: "scan",
      icon: Camera,
      label: "Scan Fridge",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "recipes",
      icon: BookOpen,
      label: "View Recipes",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "health-plan",
      icon: Heart,
      label: "Health Plan",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "groceries",
      icon: ShoppingCart,
      label: "Groceries",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  // Default values
  const defaultPersonalInfo: PersonalInfo = {
    age: 30,
    weight: 70,
    height: 170,
    sex: "male",
  };
  const defaultConditions: Conditions = {
    diabetes: false,
    highBP: false,
    highCholesterol: false,
  };
  const defaultDietary: Dietary = {
    vegetarian: false,
    vegan: false,
    lowSodium: false,
    lowCarb: false,
  };

  const [calories, setCalories] = useState<number>(0);
  const [sodium, setSodium] = useState<number>(0);
  const [sugarLimit, setSugarLimit] = useState<number>(0);

  const [currentTotals, setCurrentTotals] = useState({
    calories: 0,
    sodium: 0,
    sugar: 0,
  });

  useEffect(() => {
    if (!healthProfile) return;

    const fetchDailyTotalsFromRecipes = async () => {
      try {
        const uid = healthProfile.uid;
        if (!uid) return;

        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        // Fetch all saved recipes for today
        const response = await fetch(
          `http://localhost:8080/${uid}/recipes/saved/${dateKey}`
        );
        if (!response.ok) {
          console.warn(`No saved recipes for ${uid} on ${dateKey}`);
          setCurrentTotals({ calories: 0, sodium: 0, sugar: 0 });
          return;
        }

        const recipes = await response.json();

        let totalCalories = 0;
        let totalSodium = 0;
        let totalSugar = 0;

        for (const recipe of recipes) {
          if (!recipe?.nutrition?.nutrients) continue;
          const nutrients = recipe.nutrition.nutrients;

          totalCalories +=
            nutrients.find((n: any) => n.name === "Calories")?.amount ?? 0;
          totalSodium +=
            nutrients.find((n: any) => n.name === "Sodium")?.amount ?? 0;
          totalSugar +=
            nutrients.find((n: any) => n.name === "Sugar")?.amount ?? 0;
        }

        setCurrentTotals({
          calories: totalCalories,
          sodium: totalSodium,
          sugar: totalSugar,
        });
      } catch (err) {
        console.error("Error fetching daily totals from saved recipes:", err);
        setCurrentTotals({ calories: 0, sodium: 0, sugar: 0 });
      }
    };

    fetchDailyTotalsFromRecipes();
  }, [healthProfile]);

  useEffect(() => {
    if (!healthProfile) {
      const defaultCalories = calculateCalories(defaultPersonalInfo);
      setCalories(defaultCalories);
      setSodium(calculateSodium(defaultConditions, defaultDietary));
      setSugarLimit(calculateSugarLimit(defaultCalories, defaultConditions));
      return;
    }

    const parseNumber = (
      value: string | undefined,
      fallback: number
    ): number => {
      if (!value) return fallback;
      const match = value.match(/\d+/);
      return match ? parseInt(match[0], 10) : fallback;
    };

    const personalInfo: PersonalInfo = {
      age: parseNumber(healthProfile.personalInfo.age, defaultPersonalInfo.age),
      weight: parseNumber(
        healthProfile.personalInfo.weight,
        defaultPersonalInfo.weight
      ),
      height: parseNumber(
        healthProfile.personalInfo.height,
        defaultPersonalInfo.height
      ),
      sex: healthProfile.personalInfo.sex || defaultPersonalInfo.sex,
    };

    const conditions: Conditions =
      healthProfile.conditions || defaultConditions;
    const dietary: Dietary = healthProfile.dietary || defaultDietary;

    const calculatedCalories = calculateCalories(personalInfo);
    setCalories(calculatedCalories);
    setSodium(calculateSodium(conditions, dietary));
    setSugarLimit(calculateSugarLimit(calculatedCalories, conditions));
  }, [healthProfile]);

  // Example current stats
  const {
    calories: currentCalories,
    sodium: currentSodium,
    sugar: currentSugar,
  } = currentTotals;

  let healthAlertMessage = "";
  if (currentCalories === 0 || currentSodium === 0) {
    healthAlertMessage = "You haven't eaten anything yet. Time to fuel up!";
  } else if (currentSodium / sodium >= 0.75) {
    healthAlertMessage =
      "Your sodium intake is high. Consider low-sodium meals.";
  } else if (currentCalories / calories >= 1) {
    healthAlertMessage = "You've reached your calorie limit today!";
  } else if (currentSodium / sodium >= 1) {
    healthAlertMessage =
      "You've exceeded your sodium limit. Watch your intake!";
  } else if (currentSugar / sugarLimit >= 1) {
    healthAlertMessage =
      "You've reached your sugar limit. Try to avoid more sugary foods!";
  } else {
    healthAlertMessage = "Keep up the good work today!";
  }

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
          <h1 className="text-white">Home</h1>
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
                <div className="text-gray-900">{currentCalories}</div>
                <div className="text-green-600">/ {calories}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="text-gray-500 mb-1">Sodium</div>
                <div className="text-gray-900">{currentSodium}mg</div>
                <div className="text-orange-600">/ {sodium}mg</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="text-gray-500 mb-1">Sugar</div>
                <div className="text-gray-900">{currentSugar}g</div>
                <div className="text-blue-600">/ {sugarLimit}g</div>
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
                <p className="text-gray-700">{healthAlertMessage}</p>
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
                    onClick={() => onNavigate(action.id)}
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
