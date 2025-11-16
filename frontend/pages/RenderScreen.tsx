import { useEffect, useState } from "react";
import OnboardingScreen from "../components/OnboardingScreen";
import HealthProfileSetup from "../components/HealthProfileSetup";
import Dashboard from "../components/Dashboard";
import ReceiptScanScreen from "../components/ReceiptScanScreen";
import ReceiptConfirmScreen from "../components/ReceiptConfirmScreen";
import RecipesScreen from "../components/RecipesScreen";
import HealthPlanScreen from "../components/HealthPlanScreen";
import ProfileScreen from "../components/ProfileScreen";
import GroceryStoreScreen from "../components/GroceryStoreScreen";
import BottomNav from "../components/BottomNav";
import { FavoriteRecipes } from "../components/FavoriteRecipes";
import { auth } from "../firebaseConfig";

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<string>("onboarding");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthProfile, setHealthProfile] = useState<any>(null);

  // -------------------- Fetch health data on mount --------------------
  useEffect(() => {
    const checkHealthData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/${user.uid}/healthdata`);
        setHealthProfile(await res.json());
        if (res.ok) {
          // Health data exists, skip profile setup
          setCurrentScreen("home");
        } else if (res.status === 404) {
          // No health data, go to profile setup
          setCurrentScreen("profile-setup");
        } else {
          console.warn(
            "Unexpected response from healthdata endpoint",
            res.status
          );
          setCurrentScreen("profile-setup");
        }
      } catch (err) {
        console.error("Error fetching healthdata:", err);
        setCurrentScreen("profile-setup");
      } finally {
        setLoading(false);
      }
    };

    checkHealthData();
  }, []);

  if (loading) return <div>Loading...</div>;

  // -------------------- Handlers --------------------
  const handleOnboardingNext = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setCurrentScreen("profile-setup");
    }
  };

  const handleProfileComplete = () => {
    setCurrentScreen("home");
  };

  const handleScanComplete = (items: string[]) => {
    setScannedItems(items);
    setCurrentScreen("receipt-confirm");
  };

  const handleReceiptConfirm = () => {
    setCurrentScreen("home");
  };

  // -------------------- Render screens --------------------
  const renderScreen = () => {
    switch (currentScreen) {
      case "onboarding":
        return (
          <OnboardingScreen
            step={onboardingStep}
            onNext={handleOnboardingNext}
          />
        );
      case "profile-setup":
        return <HealthProfileSetup onComplete={handleProfileComplete} />;
      case "home":
        return (
          <Dashboard
            onNavigate={setCurrentScreen}
            healthProfile={healthProfile}
          />
        );
      case "scan":
        return (
          <ReceiptScanScreen
            onBack={() => setCurrentScreen("home")}
            onNavigate={setCurrentScreen}
          />
        );
      case "receipt-confirm":
        return (
          <ReceiptConfirmScreen
            items={scannedItems}
            onConfirm={handleReceiptConfirm}
            onBack={() => setCurrentScreen("scan")}
          />
        );
      case "recipes":
        return <RecipesScreen onNavigate={setCurrentScreen} />;
      case "meal-prep":
        return <FavoriteRecipes onBack={() => setCurrentScreen("recipes")} />;
      case "health-plan":
        return <HealthPlanScreen />;
      case "profile":
        return <ProfileScreen />;
      case "groceries":
        return <GroceryStoreScreen onBack={() => setCurrentScreen("home")} />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} healthProfile={null} />;
    }
  };

  const showBottomNav = ![
    "onboarding",
    "profile-setup",
    "scan",
    "receipt-confirm",
  ].includes(currentScreen);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="relative w-full max-w-[390px] h-screen bg-white shadow-2xl overflow-hidden">
        {renderScreen()}
        {showBottomNav && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
          />
        )}
      </div>
    </div>
  );
};

export default App;
