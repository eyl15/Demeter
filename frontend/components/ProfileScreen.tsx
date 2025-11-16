import {
  User,
  Heart,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { auth, logout } from "../firebaseConfig";
import { useEffect, useState } from "react";

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState("Loading");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [activeConditions, setActiveConditions] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("[PROFILE] No authenticated user");
        return;
      }

      setEmail(user.email || "");
      console.log(`[PROFILE] Fetching healthdata for uid: ${user.uid}`);

      try {
        const res = await fetch(`http://localhost:8080/${user.uid}/healthdata`);

        console.log(`[PROFILE] Healthdata response status: ${res.status}`);

        if (!res.ok) {
          const errorData = await res.json();
          console.warn("[PROFILE] Healthdata not found or error:", errorData);
          return; // gracefully handle missing healthdata
        }

        const data = await res.json();
        console.log("[PROFILE] Received healthdata:", data);

        // Extract firstName and lastName from the nested personalInfo structure
        const firstName = data.personalInfo?.firstName || "User";
        const lastName = data.personalInfo?.lastName || "";

        setFirstName(firstName);
        setLastName(lastName);

        // Extract active conditions
        const conditions: string[] = [];
        if (data.conditions?.highBP) {
          conditions.push("High Blood Pressure");
        }
        if (data.conditions?.highCholesterol) {
          conditions.push("High Cholesterol");
        }
        if (data.conditions?.diabetes) {
          conditions.push("Diabetes");
        }

        setActiveConditions(conditions);
        console.log("[PROFILE] Active conditions:", conditions);
      } catch (err) {
        console.error("[PROFILE] Failed to fetch healthdata:", err);
        // Gracefully handle network errors; leave names as defaults
      }
    };

    fetchProfile();
  }, []);

  const initials = (firstName?.[0] || "") + (lastName?.[0] || "");

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
            <span className="text-2xl">{initials}</span>
          </div>
          <div>
            <h2 className="text-gray-900">{`${firstName} ${lastName}`}</h2>
            <p className="text-gray-600">{email}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Health Profile */}
        <div className="mb-4">
          <h3 className="text-gray-900 mb-3 px-2">Health Profile</h3>
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between py-3 border-b cursor-pointer">
              <div className="flex items-center gap-3">
                <Heart className="text-red-600" size={20} />
                <span className="text-gray-900">Medical Conditions</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <div className="py-3">
              <p className="text-gray-600 mb-2">Active Conditions:</p>
              <div className="flex flex-wrap gap-2">
                {activeConditions.length > 0 ? (
                  activeConditions.map((condition, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full ${
                        condition === "High Blood Pressure"
                          ? "bg-red-100 text-red-700"
                          : condition === "High Cholesterol"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {condition}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No active conditions</span>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Settings */}
        <div className="mb-4">
          <h3 className="text-gray-900 mb-3 px-2">Settings</h3>
          <Card className="p-4 bg-white divide-y">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="text-blue-600" size={20} />
                <span className="text-gray-900">Notifications</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="text-blue-600" size={20} />
                <span className="text-gray-900">Health Reminders</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-600" size={20} />
                <span className="text-gray-900">Privacy & Security</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <Settings className="text-gray-600" size={20} />
                <span className="text-gray-900">App Preferences</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </div>

        {/* Support */}
        <div className="mb-4">
          <h3 className="text-gray-900 mb-3 px-2">Support</h3>
          <Card className="p-4 bg-white divide-y">
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-green-600" size={20} />
                <span className="text-gray-900">Help Center</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
            <div className="flex items-center justify-between py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <User className="text-green-600" size={20} />
                <span className="text-gray-900">Contact Support</span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="p-4 bg-white mb-4">
          <button className="flex items-center gap-3 w-full py-2 text-red-600">
            <LogOut size={20} />
            <span onClick={() => logout()}>Log Out</span>
          </button>
        </Card>

        {/* App Info */}
        <div className="text-center text-gray-500 py-4">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2025 HealthNutrition App</p>
        </div>
      </div>
    </div>
  );
}
