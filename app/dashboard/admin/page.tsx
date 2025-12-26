"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queueVideo } from "@/services/api";
import { useState } from "react";

const dummyActions = [
  { id: "greet", label: "👋 Угтан авалтын үг", color: "bg-blue-600 hover:bg-blue-700", video: "/Speech/Welcome.mp4" },
  { id: "announce", label: "📢 Үйл ажиллагааны танилцуулга", color: "bg-purple-600 hover:bg-purple-700", video: null },
  { id: "competition", label: "🎉 House QR hunt үг", color: "bg-green-600 hover:bg-green-700", video: "/Speech/QR_Hunt_2.mp4" },
  { id: "lunch", label: "😄 Lunch-ны үг", color: "bg-yellow-600 hover:bg-yellow-700", video: null },
  { id: "talent_1", label: "🙏 Talent showcase-н үг (МТАХ-ийн мэндчилгээ)", color: "bg-red-600 hover:bg-red-700", video: null },
  { id: "talent_2", label: "🙏 Talent showcase-н үг (Оролцогчдын мэндчилгээ)", color: "bg-red-600 hover:bg-red-700", video: null },
  { id: "fun_and_physical", label: "⏱️ Fun and Physical game-ын үг", color: "bg-cyan-600 hover:bg-cyan-700", video: null },
  { id: "fun_and_physical_phase_1", label: "⏱️ Fun and Physical game-ын үг (Phase 1)", color: "bg-cyan-600 hover:bg-cyan-700", video: null },
  { id: "fun_and_physical_phase_2", label: "⏱️ Fun and Physical game-ын үг (Phase 2)", color: "bg-cyan-600 hover:bg-cyan-700", video: null },
  { id: "lucky_box", label: "⏱️ Lucky box-н үг", color: "bg-pink-600 hover:bg-pink-700", video: null },
  { id: "lucky_box_1", label: "⏱️ Lucky box-н үг (First Place)", color: "bg-pink-600 hover:bg-pink-700", video: null },
  { id: "lucky_box_2", label: "⏱️ Lucky box-н үг (Second Place)", color: "bg-pink-600 hover:bg-pink-700", video: null },
  { id: "lucky_box_3", label: "⏱️ Lucky box-н үг (Third Place)", color: "bg-pink-600 hover:bg-pink-700", video: null },
  { id: "gift_unwrapping", label: "⏱️ Бэлэг сугалах ажиллагааны үг", color: "bg-red-600 hover:bg-red-700", video: null },
  { id: "break", label: "⏱️ Завсарлагааны үг", color: "bg-emerald-600 hover:bg-emerald-700", video: null },
  { id: "dinner", label: "⏱️ Dinner-ны үг", color: "bg-lime-600 hover:bg-lime-700", video: null },
  { id: "secret_santa", label: "⏱️ Secret Santa-ны үг", color: "bg-slate-600 hover:bg-slate-700", video: null },
  { id: "award", label: "⏱️ Award-ны үг", color: "bg-teal-600 hover:bg-teal-700", video: null },
  { id: "cover_singer", label: "⏱️ Cover Singer-ын үг", color: "bg-sky-600 hover:bg-sky-700", video: null },
  { id: "after_party_1", label: "⏱️ After party-ны үг (Дотор)", color: "bg-violet-600 hover:bg-violet-700", video: null },
  { id: "after_party_2", label: "⏱️ After party-ны үг (Гадаа)", color: "bg-violet-600 hover:bg-red-700", video: null },
  { id: "mini_countdown", label: "⏱️ Mini Countdown-ы үг", color: "bg-rose-600 hover:bg-rose-700", video: null },
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