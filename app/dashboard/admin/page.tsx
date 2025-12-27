"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queueVideo } from "@/services/api";
import { useEffect, useRef, useState } from "react";

const dummyActions = [
  { id: "greet", label: "👋 Угтан авалтын үг", color: "bg-blue-600 hover:bg-blue-700", video: "/Speech/Ugtan awah.mp4" },
  { id: "announce", label: "📢 Үйл ажиллагааны танилцуулга", color: "bg-purple-600 hover:bg-purple-700", video: "/Speech/Uil_Ajillagaanii_taniltsuulga.mp4" },
  { id: "competition_1", label: "🎉 House QR hunt үг Part 1", color: "bg-green-600 hover:bg-green-700", video: "/Speech/QR_Hunt_1.mp4" },
  { id: "competition_2", label: "🎉 House QR hunt үг Part 2", color: "bg-green-600 hover:bg-green-700", video: "/Speech/QR_Hunt_2.mp4" },
  { id: "lunch", label: "😄 Lunch-ны үг", color: "bg-yellow-600 hover:bg-yellow-700", video: "/Speech/Lunch.mp4" },
  { id: "team_challenge", label: "😄 Team Challenge-ны үг", color: "bg-yellow-600 hover:bg-yellow-700", video: "/Speech/Team Challenge.mp4" },
  { id: "talent_1", label: "🙏 Talent showcase-н үг (МТАХ-ийн мэндчилгээ)", color: "bg-red-600 hover:bg-red-700", video: "/Speech/Talent Showcase_before.mp4" },
  { id: "talent_2", label: "🙏 Talent showcase-н үг (Оролцогчдын мэндчилгээ)", color: "bg-red-600 hover:bg-red-700", video: "/Speech/Talent Showcase after.mp4" },
  { id: "fun_and_physical_phase_1", label: "⏱️ Fun and Physical game-ын үг (Phase 1)", color: "bg-cyan-600 hover:bg-cyan-700", video: "/Speech/Fun and Physical first.mp4" },
  { id: "fun_and_physical_phase_2", label: "⏱️ Fun and Physical game-ын үг (Phase 2)", color: "bg-cyan-600 hover:bg-cyan-700", video: "/Speech/Fun and Physical second.mp4" },
  { id: "lucky_box", label: "⏱️ Lucky box-н үг", color: "bg-pink-600 hover:bg-pink-700", video: "/Speech/Lucky Box.mp4" },
  { id: "lucky_box_1", label: "⏱️ Lucky box-н үг (First Place)", color: "bg-pink-600 hover:bg-pink-700", video: "/Speech/Lucky Box First Place.mp4" },
  { id: "lucky_box_2", label: "⏱️ Lucky box-н үг (Second Place)", color: "bg-pink-600 hover:bg-pink-700", video: "/Speech/Lucky Box Second Place.mp4" },
  { id: "lucky_box_3", label: "⏱️ Lucky box-н үг (Third Place)", color: "bg-pink-600 hover:bg-pink-700", video: "/Speech/Lucky Box Third Place.mp4" },
  { id: "gift_unwrapping", label: "⏱️ Бэлэг сугалах ажиллагааны үг", color: "bg-red-600 hover:bg-red-700", video: "/Speech/Beleg Sugalah uil ajillagaa.mp4" },
  { id: "break", label: "⏱️ Завсарлагааны үг", color: "bg-emerald-600 hover:bg-emerald-700", video: "/Speech/Zawsarlagaanii ug.mp4" },
  { id: "dinner", label: "⏱️ Dinner-ны үг", color: "bg-lime-600 hover:bg-lime-700", video: "/Speech/Dinner.mp4" },
  { id: "secret_santa", label: "⏱️ Secret Santa-ны үг", color: "bg-slate-600 hover:bg-slate-700", video: "/Speech/Secret Santa.mp4" },
  { id: "award", label: "⏱️ Award-ны үг", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/Award.mp4" },
  { id: "award_prince", label: "⏱️ Award-ны үг (Шилдэг ханхүү)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/Hanhuu.mp4" },
  { id: "award_princess", label: "⏱️ Award-ны үг (Шилдэг гүнж)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/Gunj.mp4" },
  { id: "award_team", label: "⏱️ Award-ны үг (Шилдэг баг)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/shildeg_bag.mp4" },
  { id: "award_sweater", label: "⏱️ Award-ны үг (Шилдэг Ugly sweater)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/Ugly.mp4" },
  { id: "award_solongo", label: "⏱️ Award-ны үг (Шилдэг ажилтан гардуулах Солонго)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/Solongo.mp4" },
  { id: "award_worker_1", label: "⏱️ Award-ны үг (Шилдэг Ажилтан Бямбадорж)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/shildeg_bymbadorj.mp4" },
  { id: "award_worker_2", label: "⏱️ Award-ны үг (Шилдэг Ажилтан Э.Хулан)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/shildeg_hulan.mp4" },
  { id: "award_comment", label: "⏱️ Award-ны үг (Шилдэг ажилтан сэтгэгдэл)", color: "bg-teal-600 hover:bg-teal-700", video: "/Speech/Setgegdel.mp4" },
  { id: "cover_singer", label: "⏱️ Cover Singer-ын үг", color: "bg-sky-600 hover:bg-sky-700", video: "/Speech/coversinger.mp4" },
  { id: "after_party_1", label: "⏱️ After party-ны үг (Дотор)", color: "bg-violet-600 hover:bg-violet-700", video: "/Speech/after party.mp4" },
  { id: "mini_countdown_inside", label: "⏱️ Mini Countdown-ы үг", color: "bg-rose-600 hover:bg-rose-700", video: "/Speech/countdown dotor.mp4" },
  { id: "mini_countdown_outside", label: "⏱️ Mini Countdown-ы үг", color: "bg-rose-600 hover:bg-rose-700", video: "/Speech/countdown outside.mp4" },
];

const repeatedActions = [
  // { id: "thanks", label: "👋 Баярлалаа", color: "bg-blue-600 hover:bg-blue-700", video: "/q/Ugtan awah.mp4" },
  { id: "attention", label: "⏱️ Анхаарлын үг", color: "bg-emerald-600 hover:bg-emerald-700", video: "/quick/Attention everyone.mp4" },
  { id: "clap_1", label: "⏱️ clap 1", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/Clapping animation.mp4" },
  { id: "clap_2", label: "⏱️ clap 2", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/Clapping_2.mp4" },
  { id: "clap_3", label: "⏱️ clap 3", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/clapping_3.mp4" },
  { id: "next", label: "⏱️ next", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/Daraagiin hutulbur.mp4" },
  { id: "song", label: "⏱️ song liked?", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/Duu taalagsan uu.mp4" },
  { id: "food", label: "⏱️ food liked?", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/Khool amttai baina uu.mp4" },
  { id: "pose_1", label: "⏱️ pose 1", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/pose 1.mp4" },
  { id: "pose_2", label: "⏱️ pose 2", color: "bg-lime-600 hover:bg-lime-700", video: "/quick/pose 2.mp4" },
];

type Celebration = {
  title: string;
  image: string;
};

export default function AvatarControlPage() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("nominee-celebration");
    channelRef.current = channel;
    channel.onmessage = (ev) => {
      const data = ev.data as Celebration | null;
      setCelebration(data ?? null);
    };
    return () => channel.close();
  }, []);

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

  const handleCelebrate = (title: string, image: string) => {
    const payload = { title, image };
    setCelebration(payload);
    if (channelRef.current) {
      channelRef.current.postMessage(payload);
    }
  };

  const handleCloseCelebration = () => {
    setCelebration(null);
    if (channelRef.current) {
      channelRef.current.postMessage(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Avatar Control</h1>
        <p className="text-gray-400">Send commands to the AI host on the main display</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">All Actions</CardTitle>
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

        {/* Repeated Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Repeated Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {repeatedActions.map((action) => (
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
      </div>

    {/* Nominee Celebrations */}
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Nominee Celebrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={() => handleCelebrate("🏆 Nominee Spotlight", "/celebrate/nominee1.jpg")}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Show Nominee 1
        </Button>
        <Button
          onClick={() => handleCelebrate("🎉 Special Mention", "/celebrate/nominee2.jpg")}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
        >
          Show Nominee 2
        </Button>
      </CardContent>
    </Card>

    {/* Celebration Overlay */}
    {celebration && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="absolute h-72 w-72 animate-ping rounded-full bg-pink-500/30 blur-3xl" aria-hidden />
        <div className="relative max-w-3xl w-full bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <span className="text-white text-lg font-semibold">{celebration.title}</span>
            <button
              onClick={handleCloseCelebration}
              className="text-slate-200 hover:text-white"
              aria-label="Close celebration"
            >
              ✕
            </button>
          </div>
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 flex flex-col items-center">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.18),_transparent_45%)]" aria-hidden />
            <img
              src={celebration.image}
              alt={celebration.title}
              className="relative z-10 max-h-[70vh] w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    )}
    </div>
  );
}