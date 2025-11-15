import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Camera, Upload, CheckCircle2, X, Edit2, Plus } from "lucide-react";

export function ReceiptScanner() {
  const [step, setStep] = useState<"scan" | "confirm">("scan");
  const [scannedItems, setScannedItems] = useState([
    {
      id: 1,
      name: "Organic Spinach",
      quantity: "1 bunch",
      category: "Produce",
      editable: false,
    },
    {
      id: 2,
      name: "Chicken Breast",
      quantity: "2 lbs",
      category: "Meat",
      editable: false,
    },
    {
      id: 3,
      name: "Brown Rice",
      quantity: "1 bag",
      category: "Grains",
      editable: false,
    },
    {
      id: 4,
      name: "Greek Yogurt",
      quantity: "4 cups",
      category: "Dairy",
      editable: false,
    },
    {
      id: 5,
      name: "Blueberries",
      quantity: "1 pint",
      category: "Produce",
      editable: false,
    },
    {
      id: 6,
      name: "Olive Oil",
      quantity: "1 bottle",
      category: "Pantry",
      editable: false,
    },
    {
      id: 7,
      name: "Salmon Fillet",
      quantity: "1.5 lbs",
      category: "Seafood",
      editable: false,
    },
    {
      id: 8,
      name: "Sweet Potatoes",
      quantity: "3 lbs",
      category: "Produce",
      editable: false,
    },
  ]);

  const handleScan = () => {
    setStep("confirm");
  };

  const handleRemoveItem = (id: number) => {
    setScannedItems((items) => items.filter((item) => item.id !== id));
  };

  const handleConfirm = () => {
    // Reset to scan screen
    setStep("scan");
  };

  if (step === "scan") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
          <h1 className="text-white">Scan Fridge</h1>
          <p className="mt-2 opacity-90">
            Take a photo of your grocery receipt
          </p>
        </div>

        <div className="max-w-md mx-auto px-6 py-6">
          <Card className="p-8 mb-6">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
              <Camera className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-6">Position receipt in frame</p>
              <Button
                onClick={handleScan}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Camera className="mr-2 w-5 h-5" />
                Take Photo
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 w-5 h-5" />
              Upload from Gallery
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-4 text-sm text-gray-500">
                  or
                </span>
              </div>
            </div>

            <Button variant="ghost" className="w-full">
              Enter Items Manually
            </Button>
          </div>

          <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
            <h3 className="text-blue-900 mb-2">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Ensure good lighting</li>
              <li>• Keep receipt flat and straight</li>
              <li>• Include entire receipt in frame</li>
              <li>• Avoid shadows and glare</li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6">
        <h1 className="text-white">Confirm Items</h1>
        <p className="mt-2 opacity-90">Review and edit scanned items</p>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        <Card className="p-6 mb-6 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-emerald-900">Receipt scanned successfully!</p>
              <p className="text-sm text-emerald-700">
                We found {scannedItems.length} items
              </p>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2>Scanned Items</h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {scannedItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p>{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-600">{item.quantity}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleConfirm}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            Confirm & Get Recipes
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("scan")}
            className="w-full"
          >
            Scan Again
          </Button>
        </div>
      </div>
    </div>
  );
}
