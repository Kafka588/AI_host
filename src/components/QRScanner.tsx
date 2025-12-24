"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        setError("");
        setPermissionDenied(false);
        scanQRCode();
      }
    } catch (err: any) {
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

  useEffect(() => {
    if (!open) {
      setScanning(false);
      setPermissionDenied(false);
      return;
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [open]);

  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || !scanning) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simple QR detection - look for task ID in URL
    // In production, you'd use a QR code library like jsQR
    requestAnimationFrame(scanQRCode);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Task QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!permissionDenied ? (
            <>
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            <div className="bg-gray-100 rounded-lg p-6 text-center space-y-4">
              <div className="text-4xl">📷</div>
              <p className="text-gray-700 font-medium">Camera Permission Required</p>
              <p className="text-sm text-gray-600">
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
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleManualEntry}
            >
              Enter Task ID Manually
            </Button>
            <Button
              variant="outline"
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
