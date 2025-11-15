import { useState } from "react";
import OnboardingScreen from "../components/OnboardingScreen";
import HealthProfileSetup from "../components/HealthProfileSetup";
import Dashboard from "../components/Dashboard";
import ReceiptScanScreen from "../components/ReceiptScanScreen";
import ReceiptConfirmScreen from "../components/ReceiptConfirmScreen";
import RecipesScreen from "../components/RecipesScreen";
import HealthPlanScreen from "../components/HealthPlanScreen";
import ProfileScreen from "../components/ProfileScreen";
import BottomNav from "../components/BottomNav";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("onboarding");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [scannedItems, setScannedItems] = useState<string[]>([]);

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
        return <Dashboard onNavigate={setCurrentScreen} />;
      case "scan":
        return (
          <ReceiptScanScreen
            onScanComplete={handleScanComplete}
            onBack={() => setCurrentScreen("home")}
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
        return <RecipesScreen />;
      case "health-plan":
        return <HealthPlanScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} />;
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
}
