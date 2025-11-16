import { Home, Camera, BookOpen, Heart, User } from "lucide-react";

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({
  currentScreen,
  onNavigate,
}: BottomNavProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "scan", label: "Scan", icon: Camera },
    { id: "recipes", label: "Recipes", icon: BookOpen },
    { id: "health-plan", label: "Health", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`mt-1 ${isActive ? "" : ""}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
