import { useState, useRef } from "react";
import { Activity, AlertCircle, Pill, Leaf, User, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { uploadPatientSetupInfo, uploadUserMedicalReport } from "../src/utils/uploadService";
import { auth } from "../firebaseConfig";

interface HealthProfileSetupProps {
  onComplete: () => void;
}

export default function HealthProfileSetup({ onComplete }: HealthProfileSetupProps) {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    age: "",
    height: "",
    weight: "",
  });

  const [conditions, setConditions] = useState({
    diabetes: false,
    highBP: false,
    highCholesterol: false,
  });

  const [allergies, setAllergies] = useState({
    nuts: false,
    dairy: false,
    gluten: false,
    shellfish: false,
  });

  const [dietary, setDietary] = useState({
    vegetarian: false,
    vegan: false,
    lowSodium: false,
    lowCarb: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function saveHealthProfile() {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user logged in — cannot upload health profile.");
      return;
    }

    const profileData = {
      personalInfo,
      conditions,
      allergies,
      dietary,
      updatedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(profileData, null, 2);

    const file = new File(
      [new Blob([jsonString], { type: "application/json" })],
      "healthProfile.json",
      { type: "application/json" }
    );

    uploadPatientSetupInfo(
      file,
      user.uid,
      (data) => {
        console.log("Health profile uploaded:", data);
      },
      (error) => {
        console.error("Error uploading health profile:", error);
      }
    );
  }

  function formatLabel(key: string) {
    return key
      .replace(/([A-Z])/g, " $1") // insert spaces before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
  }

  // --- File upload handlers for Connect Records ---
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const user = auth.currentUser;
    if (!user || !e.target.files?.length) return;

    const file = e.target.files[0];

    await uploadUserMedicalReport(
      file,
      user.uid,
      (data) => {
        setUploadedFiles((prev) => [...prev, { name: data.name, url: data.url }]);
      },
      (error) => {
        console.error("Error uploading medical report:", error);
      }
    );

    e.target.value = ""; // reset input
  };

  const handleDeleteFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-6 border-b">
        <h1 className="text-gray-900">Health Profile</h1>
        <p className="text-gray-600 mt-1">Help us personalize your experience</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="text-purple-600" size={20} />
            <h3 className="text-gray-900">Personal Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={personalInfo.firstName}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                  }
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personalInfo.lastName}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={personalInfo.age}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, age: e.target.value })
                  }
                  placeholder="Years"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={personalInfo.height}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, height: e.target.value })
                  }
                  placeholder="cm or ft/in"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={personalInfo.weight}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, weight: e.target.value })
                  }
                  placeholder="kg or lbs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            <h3 className="text-gray-900">Medical Conditions</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(conditions).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setConditions({ ...conditions, [key]: checked as boolean })
                  }
                />
                <Label htmlFor={key}>{formatLabel(key)}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <h3 className="text-gray-900">Allergies</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(allergies).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setAllergies({ ...allergies, [key]: checked as boolean })
                  }
                />
                <Label htmlFor={key}>{formatLabel(key)}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Dietary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-600" size={20} />
            <h3 className="text-gray-900">Dietary Preferences</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(dietary).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) =>
                    setDietary({ ...dietary, [key]: checked as boolean })
                  }
                />
                <Label htmlFor={key}>{formatLabel(key)}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Connect Records */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-start gap-3">
            <Pill className="text-blue-600 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="text-gray-900 mb-1">Connect Health Records</h4>
              <p className="text-gray-600 mb-3">
                Sync with your electronic health records for automatic updates
              </p>
              <Button variant="outline" size="sm" onClick={handleFileSelect}>
                Connect Records
              </Button>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border p-2 rounded"
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                      >
                        {file.name}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-6 py-6 border-t bg-white">
        <Button
          onClick={async () => {
            await saveHealthProfile();
            onComplete();
          }}
          className="w-full"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
