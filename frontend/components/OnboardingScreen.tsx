import { Heart, Apple, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

interface OnboardingScreenProps {
  step: number;
  onNext: () => void;
}

const onboardingData = [
  {
    icon: Heart,
    title: "Your Health, Personalized",
    description:
      "Get meal recommendations tailored to your medical conditions and dietary needs.",
    color: "text-red-500",
  },
  {
    icon: Apple,
    title: "Smart Grocery Insights",
    description:
      "Scan your fridge to discover healthier alternatives and personalized recipes.",
    color: "text-green-500",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Monitor your health goals and build lasting wellness habits.",
    color: "text-blue-500",
  },
];

export default function OnboardingScreen({
  step,
  onNext,
}: OnboardingScreenProps) {
  const data = onboardingData[step - 1];
  const Icon = data.icon;

  return (
    <div className="flex flex-col h-full px-6 py-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="flex justify-end mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`h-2 w-2 rounded-full transition-all ${
                dot === step ? "bg-blue-600 w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className={`mb-8 ${data.color}`}>
          <Icon size={80} strokeWidth={1.5} />
        </div>
        <h1 className="mb-4 text-gray-900">{data.title}</h1>
        <p className="text-gray-600 max-w-sm">{data.description}</p>
      </div>

      <div className="space-y-3">
        <Button onClick={onNext} className="w-full">
          {step === 3 ? "Get Started" : "Next"}
        </Button>
        {step < 3 && (
          <button
            onClick={() => onNext()}
            className="w-full py-3 text-gray-500"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
