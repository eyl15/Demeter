import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";

interface ReceiptScanScreenProps {
  onScanComplete: (items: string[]) => void;
  onBack: () => void;
}

export default function ReceiptScanScreen({
  onScanComplete,
  onBack,
}: ReceiptScanScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    console.log("Starting camera...");
    try {
      console.log("Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      console.log("Camera stream received:", mediaStream);
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions in settings.");
    }
  };

  useEffect(() => {
    // When camera becomes active, set up video playback
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log("Video srcObject set, calling play()...");
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    // Auto-open camera when component mounts
    startCamera();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        // Convert canvas to image data URL
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);

        // Stop camera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setStream(null);
        setIsCameraActive(false);
      }
    }
  };

  const handleConfirmCapture = () => {
    // Simulate scanning - in production this would send to OCR/backend
    const mockItems = [
      "Whole Wheat Bread",
      "Chicken Breast (2 lbs)",
      "Broccoli",
      "Brown Rice",
      "Greek Yogurt",
      "Salmon Fillet",
      "Spinach",
      "Olive Oil",
      "Eggs (12 count)",
      "Tomatoes",
    ];
    onScanComplete(mockItems);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStream(null);
    setIsCameraActive(false);
    setTimeout(() => startCamera(), 100);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header with back button and title */}
      <div className="z-50 p-6 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <button onClick={onBack} className="text-white hover:text-gray-300">
          <X size={24} />
        </button>
        <h3 className="text-white text-lg font-semibold">Scan Fridge</h3>
        <div className="w-6" />
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative">
        {capturedImage ? (
          <>
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Semi-transparent overlay for better button visibility */}
            <div className="absolute inset-0 bg-black/30 z-10" />
          </>
        ) : isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={
                {
                  WebkitPlaysinline: "true",
                } as React.CSSProperties
              }
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

            {/* Bottom-left file button - bigger */}
            <button
              onClick={handleRetake}
              className="absolute bottom-8 left-6 z-20 bg-white/30 backdrop-blur-sm hover:bg-white/40 text-white rounded-full p-3 transition-all"
            >
              <ImageIcon size={28} />
            </button>

            {/* Bottom capture button (large circle) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 shadow-lg flex items-center justify-center transition-all transform hover:scale-105"
              >
                <div className="w-14 h-14 rounded-full border-4 border-gray-300" />
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Bottom Actions - only when not camera active */}
      {!isCameraActive && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-3">
          {capturedImage ? (
            <>
              <Button
                onClick={handleConfirmCapture}
                className="w-full h-14 bg-green-600 hover:bg-green-700"
              >
                Confirm & Scan
              </Button>
              <Button
                onClick={handleRetake}
                variant="outline"
                className="w-full bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              >
                Retake Photo
              </Button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
