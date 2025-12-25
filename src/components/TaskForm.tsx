"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaskFormProps = {
  onTaskAdded?: () => void;
};

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    explanation: "",
    imageUrl: "",
    score: 10,
    isPublic: false,
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
          title: formData.title,
          explanation: formData.explanation,
          imageUrl: formData.imageUrl,
          score: formData.score,
          isPublic: formData.isPublic,
          action: "create",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create task");
        return;
      }

      setSuccess("Task added successfully!");
      setFormData({ title: "", explanation: "", imageUrl: "", score: 10, isPublic: false });
      setImagePreview(null);
      onTaskAdded?.();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
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
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="score" className="text-white">
              Points for Completing Task
            </Label>
            <Input
              id="score"
              type="number"
              min="1"
              max="1000"
              value={formData.score}
              onChange={(e) => setFormData((p) => ({ ...p, score: parseInt(e.target.value) || 10 }))}
              placeholder="10"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Visibility</Label>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <input
                id="isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData((p) => ({ ...p, isPublic: e.target.checked }))}
              />
              <label htmlFor="isPublic">Publicly visible (no QR required)</label>
            </div>
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
              className="bg-slate-700 border-slate-600 text-white cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs max-h-48 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((p) => ({ ...p, imageUrl: "" }));
                  }}
                  className="mt-2 text-sm text-red-400 hover:text-red-300"
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
