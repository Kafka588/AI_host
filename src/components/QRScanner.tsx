"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import jsQR from "jsqr";

type QRScannerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (taskId: string) => void;
};

export function QRScanner({ open, onOpenChange, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lastScan, setLastScan] = useState<string>("");
  const scanIntervalRef = useRef<number | null>(null);
  const shouldScanRef = useRef(false);

  const startCamera = async () => {
    console.log("[QR] Starting camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      console.log("[QR] Camera stream obtained");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setError("");
        setPermissionDenied(false);
        
        // Set up scanning to start when video is ready
        const checkVideoReady = setInterval(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            console.log("[QR] Video ready, starting scan");
            clearInterval(checkVideoReady);
            shouldScanRef.current = true;
            setScanning(true);
            scanQRCodeLoop();
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkVideoReady);
          if (videoRef.current && videoRef.current.videoWidth === 0) {
            console.warn("[QR] Video never loaded");
            setError("Camera loaded but video stream failed. Try closing and reopening.");
          }
        }, 5000);
      }
    } catch (err: any) {
      console.error("[QR] Camera error:", err);
      // Check if it's a permission denied error
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionDenied(true);
        setError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera device found. Please check your device.");
      } else {
        setError("Unable to access camera. Please check permissions and try again.");
      }
    }
  };

  const scanQRCodeLoop = () => {
    if (!shouldScanRef.current || !videoRef.current) {
      console.log("[QR] Scan loop stopped");
      return;
    }

    try {
      scanQRCode();
    } catch (err) {
      console.error("[QR] Loop error:", err);
    }

    // Continue scanning with requestAnimationFrame (60fps)
    requestAnimationFrame(scanQRCodeLoop);
  };

  useEffect(() => {
    console.log("[QR] Dialog opened:", open);
    if (!open) {
      shouldScanRef.current = false;
      setScanning(false);
      setPermissionDenied(false);
      setLastScan("");
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      return;
    }

    startCamera();

    return () => {
      console.log("[QR] Cleanup");
      shouldScanRef.current = false;
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [open]);

  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      console.log("[QR] Missing canvas or video");
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return; // Silently skip during readiness phase
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      console.log("[QR] No canvas context");
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      console.log("[QR] Scanning frame...", { w: canvas.width, h: canvas.height });
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });
      
      if (code && code.data) {
        if (code.data === lastScan) return; // Skip duplicate
        
        console.log("[QR] Code detected:", code.data);
        setLastScan(code.data);
        shouldScanRef.current = false;
        setScanning(false);
        
        const taskId = code.data.includes('taskId=') 
          ? new URL(code.data).searchParams.get('taskId') || code.data
          : code.data;
        
        console.log("[QR] Extracted taskId:", taskId);
        onScan(taskId);
        
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    } catch (err) {
      console.error("[QR] Scan error:", err);
    }
  };

  const handleManualEntry = () => {
    const taskId = prompt("Enter Task ID:");
    if (taskId) {
      onScan(taskId);
      onOpenChange(false);
    }
  };

  const handleRetryPermission = () => {
    setPermissionDenied(false);
    setError("");
    startCamera();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="break-words">Scan Task QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!permissionDenied ? (
            <>
              <div className="bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                {scanning && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    📷 Scanning...
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            <div className="bg-gray-100 rounded-lg p-6 text-center space-y-4">
              <div className="text-4xl">📷</div>
              <p className="text-gray-700 font-medium">Camera Permission Required</p>
              <p className="text-sm text-gray-600 break-words">
                Please allow camera access in your browser settings to scan QR codes. You can also enter the task ID manually below.
              </p>
              <Button
                onClick={handleRetryPermission}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Request Permission Again
              </Button>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded break-words">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleManualEntry}
            >
              Enter Task ID Manually
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
