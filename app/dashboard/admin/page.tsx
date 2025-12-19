"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queueVideo } from "@/services/api";
import { useState } from "react";

const dummyActions = [
  { id: "greet", label: "👋 Greet", color: "bg-blue-600 hover:bg-blue-700", video: "/Speech/Welcome.mp4" },
  { id: "announce", label: "📢 Announce", color: "bg-purple-600 hover:bg-purple-700", video: null },
  { id: "celebrate", label: "🎉 Celebrate", color: "bg-green-600 hover:bg-green-700", video: null },
  { id: "joke", label: "😄 Tell Joke", color: "bg-yellow-600 hover:bg-yellow-700", video: null },
  { id: "thanks", label: "🙏 Thank", color: "bg-pink-600 hover:bg-pink-700", video: null },
  { id: "countdown", label: "⏱️ Countdown", color: "bg-red-600 hover:bg-red-700", video: null },
];

export default function AvatarControlPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAction = async (actionId: string, video: string | null) => {
    try {
      setLoading(true);
      setFeedback(`Sending ${actionId}...`);

      if (video) {
        await queueVideo(video);
        setFeedback(`✓ ${actionId} queued! Will play after current video.`);
      } else {
        setFeedback(`Action: ${actionId} (no video configured)`);
      }

      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback(`✗ Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Avatar Control</h1>
        <p className="text-gray-400">Send commands to the AI host on the main display</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Buttons */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dummyActions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleAction(action.id, action.video)}
                disabled={loading}
                className={`w-full ${action.color} text-white disabled:opacity-50`}
              >
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Status Panel */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Main Display</span>
              <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">Live</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Current Video</span>
              <span className="text-white">loop_distracted.mp4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Active Users</span>
              <span className="text-white">24</span>
            </div>
            {feedback && (
              <div className={`p-3 rounded text-sm ${feedback.includes("✗") ? "bg-red-600" : "bg-green-600"} text-white`}>
                {feedback}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}