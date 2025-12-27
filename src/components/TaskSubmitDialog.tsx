"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaskSubmitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
  onSuccess: () => void;
};

export function TaskSubmitDialog({ open, onOpenChange, taskId, taskTitle, onSuccess }: TaskSubmitDialogProps) {
  const { user } = useAuth();
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofType, setProofType] = useState<"image" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    
    // Detect if it's image or video
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    
    if (!isImage && !isVideo) {
      setError("Please upload an image or video file");
      return;
    }
    
    setProofType(isVideo ? "video" : "image");
    setUploading(true);
    setError("");
    
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      
      // Upload to R2 immediately
      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media: dataUrl,
            type: "submission",
            filename: `${user?.id}-${Date.now()}-${file.name}`,
          }),
        });

        const uploadData = await uploadResponse.json();
        
        if (uploadResponse.ok) {
          setProofImage(uploadData.url);
        } else {
          console.error("Upload failed:", uploadData.error);
          // Fallback to base64
          setProofImage(dataUrl);
        }
      } catch (err) {
        console.error("Upload error:", err);
        // Fallback to base64
        setProofImage(dataUrl);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setError("");

    try {
      const payload = {
        action: "create",
        userId: user.id,
        userName: user.username,
        taskId,
        taskTitle,
        proofImage,
      };

      console.log("Submitting:", payload);

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        onSuccess();
        onOpenChange(false);
        setProofImage(null);
        setProofType(null);
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle className="break-words">Submit Proof for: {taskTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Upload Proof (Image or Video) - Optional</Label>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              disabled={uploading}
              className="mt-2"
            />
            <p className="text-xs text-gray-400 mt-1 break-words">Supported: Images (JPG, PNG) and Videos (MP4, MOV, WebM). Leave empty if not required.</p>
          </div>

          {proofImage && (
            <div>
              <Label>Preview</Label>
              {proofType === "video" ? (
                <video 
                  src={proofImage} 
                  controls 
                  className="w-full h-48 object-cover rounded mt-2"
                  preload="metadata"
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <img src={proofImage} alt="Proof" className="w-full h-48 object-cover rounded mt-2" />
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded break-words">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {uploading ? "Submitting..." : "Submit"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
