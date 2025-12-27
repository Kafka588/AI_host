"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Task = {
  id: string;
  title: string;
  explanation: string;
  image_url: string | null;
  score: number;
  is_public?: boolean;
};

type EditTaskFormProps = {
  task: Task;
  onTaskUpdated?: () => void;
};

export function EditTaskForm({ task, onTaskUpdated }: EditTaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(task.image_url);
  const [formData, setFormData] = useState({
    title: task.title,
    explanation: task.explanation,
    imageUrl: task.image_url || "",
    score: task.score,
    isPublic: task.is_public || false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        setImagePreview(dataUrl);
        
        // Upload to R2 immediately
        try {
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: dataUrl,
              type: "task",
              filename: `${Date.now()}-${file.name}`,
            }),
          });

          const uploadData = await uploadResponse.json();
          
          if (uploadResponse.ok) {
            setFormData((p) => ({ ...p, imageUrl: uploadData.url }));
          } else {
            console.error("Upload failed:", uploadData.error);
            // Fallback to base64 if R2 upload fails
            setFormData((p) => ({ ...p, imageUrl: dataUrl }));
          }
        } catch (err) {
          console.error("Upload error:", err);
          // Fallback to base64
          setFormData((p) => ({ ...p, imageUrl: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title.trim() || !formData.explanation.trim()) {
      setError("Title and explanation are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          taskId: task.id,
          title: formData.title,
          explanation: formData.explanation,
          imageUrl: formData.imageUrl,
          score: formData.score,
          isPublic: formData.isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update task");
        return;
      }

      setSuccess("Task updated successfully!");
      setTimeout(() => {
        onTaskUpdated?.();
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="pt-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-600 px-3 py-2 text-sm text-white">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-600 px-3 py-2 text-sm text-white">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Task Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Collect Photos"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-white">
              Detailed Explanation
            </Label>
            <textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => setFormData((p) => ({ ...p, explanation: e.target.value }))}
              placeholder="Describe the task in detail..."
              rows={5}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="score" className="text-white">
              Points
            </Label>
            <Input
              id="score"
              type="number"
              value={formData.score}
              onChange={(e) => setFormData((p) => ({ ...p, score: parseInt(e.target.value) || 0 }))}
              min="1"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-white">
              Task Image
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-slate-700 border-slate-600 text-white"
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="max-w-xs rounded" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="public"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData((p) => ({ ...p, isPublic: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="public" className="text-white cursor-pointer">
              Make task public (visible without QR scan)
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
