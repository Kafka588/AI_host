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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proofImage || !user) {
      setError("Please upload proof image");
      return;
    }

    setUploading(true);
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
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit task");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Proof for: {taskTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Upload Proof Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="mt-2"
            />
          </div>

          {proofImage && (
            <div>
              <Label>Preview</Label>
              <img src={proofImage} alt="Proof" className="w-full h-48 object-cover rounded mt-2" />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={uploading || !proofImage}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {uploading ? "Submitting..." : "Submit Proof"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
