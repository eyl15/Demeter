import { Camera, X, Image as ImageIcon } from "lucide-react";
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
    return () => {
      // Cleanup: stop camera when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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

  const handleScan = () => {
    if (!isCameraActive) {
      startCamera();
    } else {
      handleCapture();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="text-white">
            <X size={24} />
          </button>
          <h3 className="text-white">Scan Receipt</h3>
          <div className="w-6" />
        </div>
      </div>

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
              className="absolute inset-0 w-full h-full object-cover bg-black"
              style={
                {
                  WebkitPlaysinline: "true",
                } as React.CSSProperties
              }
            />
            {/* Overlay with scanning frame */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-[280px] h-[360px] border-2 border-white border-dashed rounded-lg" />
            </div>
            {/* Corner Indicators */}
            <div className="absolute z-20 w-[280px] h-[360px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {/* Top Left */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
              {/* Top Right */}
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
              {/* Bottom Left */}
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
              {/* Bottom Right */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-linear-to-b from-gray-800 to-gray-900 flex items-center justify-center z-10">
            {/* Scanning Frame Placeholder */}
            <div className="w-[280px] h-[360px] border-2 border-white border-dashed rounded-lg flex items-center justify-center">
              <div className="text-center text-white/70">
                <Camera size={48} className="mx-auto mb-2" />
                <p>Position receipt within frame</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 space-y-3">
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
        ) : (
          <>
            <Button
              onClick={handleScan}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="mr-2" size={20} />
              {isCameraActive ? "Capture Receipt" : "Open Camera"}
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
            >
              <ImageIcon className="mr-2" size={20} />
              Upload from Gallery
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
