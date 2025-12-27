"use client";

import { AdminRoute } from "@/components/AdminRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VideoLooper } from "@/components/VideoLooper";
import { WarmMessages } from "@/components/WarmMessages";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

type Nominee = {
  name: string;
  score: number;
	photo_url?: string | null;
};

type Team = {
  name: string;
  score: number;
};

type Celebration = {
	title: string;
	image: string;
};

function Board({
	title,
	items,
}: {
	title: string;
	items: { name: string; score: number; photo_url?: string | null }[];
}) {
	const topItems = items.slice(0, 5);
	return (
		<Card className="w-full bg-[#454545] border-none m-0 p-4">
			<div className="px-3 py-0 text-lg font-bold text-white leading-none">{title}</div>
			<CardContent className="p-2">
				<Table className="text-sm">
					<TableHeader>
						<TableRow className="text-[#929292]">
							<TableHead className="w-[60px] text-xs">№</TableHead>
							<TableHead className="text-xs">Name</TableHead>
							<TableHead className="text-right text-xs">Score</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{topItems.map((item, i) => (
								<TableRow key={item.name} className="h-8 my-2">
								<TableCell className="p-1">
									<div className="h-6 w-6 rounded-full overflow-hidden bg-[#2d2d2d] flex items-center justify-center text-xs text-white">
										{item.photo_url ? (
											<img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" />
										) : (
											<Badge variant="secondary" className="justify-center w-8 h-8 text-xs bg-[#6b7280] text-white p-0">
												{i + 1}
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell className="truncate text-white text-xs p-1">{item.name}</TableCell>
								<TableCell className="text-right font-semibold text-[#FFD700] text-xs p-1">
									{item.score}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

// Shuffle helper
function shuffle<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export default function AdminPage() {
	const [videos, setVideos] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [princess, setPrincess] = useState<Nominee[]>([]);
	const [prince, setPrince] = useState<Nominee[]>([]);
	const [sweater, setSweater] = useState<Nominee[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
  const [activeMediaEl, setActiveMediaEl] = useState<HTMLVideoElement | null>(null);
	const [audioEnabled, setAudioEnabled] = useState(false);
	const [activeAnalyser, setActiveAnalyser] = useState<AnalyserNode | undefined>(undefined);
	const audioContextRef = useRef<AudioContext | null>(null);
	const v1AnalyserRef = useRef<AnalyserNode | null>(null);
	const v2AnalyserRef = useRef<AnalyserNode | null>(null);
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

	// Set up persistent Web Audio connections for both video elements
	useEffect(() => {
		if (!activeMediaEl) return;
		
		// Get the video element's parent refs (v1 and v2)
		const videoElements = activeMediaEl.parentElement?.querySelectorAll('video');
		if (!videoElements || videoElements.length < 2) return;
		
		const v1 = videoElements[0] as HTMLVideoElement;
		const v2 = videoElements[1] as HTMLVideoElement;
		
		// Only set up once
		if (audioContextRef.current) {
			// Just update which analyser is active based on current element
			setActiveAnalyser(activeMediaEl === v1 ? v1AnalyserRef.current ?? undefined : v2AnalyserRef.current ?? undefined);
			return;
		}
		
		// Create audio context and connect both video elements permanently
		try {
			const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
			audioContextRef.current = audioCtx;
			
			// Create sources and analysers for both videos
			const source1 = audioCtx.createMediaElementSource(v1);
			const analyser1 = audioCtx.createAnalyser();
			analyser1.fftSize = 2048;
			analyser1.smoothingTimeConstant = 0.85;
			source1.connect(analyser1);
			analyser1.connect(audioCtx.destination);
			v1AnalyserRef.current = analyser1;
			
			const source2 = audioCtx.createMediaElementSource(v2);
			const analyser2 = audioCtx.createAnalyser();
			analyser2.fftSize = 2048;
			analyser2.smoothingTimeConstant = 0.85;
			source2.connect(analyser2);
			analyser2.connect(audioCtx.destination);
			v2AnalyserRef.current = analyser2;
			
			// Set initial active analyser
			setActiveAnalyser(activeMediaEl === v1 ? analyser1 : analyser2);
			
			// Resume context on play events
			const resumeAudio = () => {
				if (audioCtx.state === 'suspended') {
					audioCtx.resume().catch(() => {});
				}
			};
			v1.addEventListener('play', resumeAudio);
			v2.addEventListener('play', resumeAudio);
		} catch (e) {
			console.warn('Could not set up Web Audio:', e);
		}
	}, [activeMediaEl]);

	useEffect(() => {
		// If audio has been enabled by user gesture, ensure the
		// currently active media element is unmuted and playing.
		if (audioEnabled && activeMediaEl) {
			try {
				activeMediaEl.muted = false;
				activeMediaEl.play().catch(() => {});
				// Resume audio context if needed
				if (audioContextRef.current?.state === 'suspended') {
					audioContextRef.current.resume().catch(() => {});
				}
			} catch {}
		}
	}, [audioEnabled, activeMediaEl]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch voting data
				const votesResponse = await fetch("/api/votes");
				const votesData = await votesResponse.json();

				if (votesResponse.ok) {
					const nominees = votesData.nominees || [];

					// Separate by category and sort by vote count
					const princessList = nominees
						.filter((n: any) => n.category === "princess")
						.sort((a: any, b: any) => b.voteCount - a.voteCount)
						.map((n: any) => ({
							name: n.name,
							score: n.voteCount,
							photo_url: n.photo_url,
						}));

					const princeList = nominees
						.filter((n: any) => n.category === "prince")
						.sort((a: any, b: any) => b.voteCount - a.voteCount)
						.map((n: any) => ({
							name: n.name,
							score: n.voteCount,
							photo_url: n.photo_url,
						}));

					const sweaterList = nominees
						.filter((n: any) => n.category === "ugly_sweater")
						.sort((a: any, b: any) => b.voteCount - a.voteCount)
						.map((n: any) => ({
							name: n.name,
							score: n.voteCount,
							photo_url: n.photo_url,
						}));

					setPrincess(princessList);
					setPrince(princeList);
					setSweater(sweaterList);
				}

				// Fetch leaderboard data
				const leaderboardResponse = await fetch("/api/leaderboard");
				const leaderboardData = await leaderboardResponse.json();

				if (leaderboardResponse.ok) {
					setTeams(leaderboardData.teams || []);
				}
			} catch (err) {
				console.error("Failed to fetch data:", err);
			}
		};

		// Fetch videos
		fetch("/api/avatar-videos")
			.then((res) => res.json())
			.then((data) => {
				const shuffled = shuffle((data.videos || []) as string[]);
				setVideos(shuffled);
			})
			.catch(() => {
				console.error("Failed to fetch videos");
			})
			.finally(() => {
				setLoading(false);
			});

		// Fetch voting and leaderboard data
		fetchData();

		// Refresh voting data every 5 seconds
		const interval = setInterval(fetchData, 5000);
		return () => clearInterval(interval);
	}, []);

	return (
		<AdminRoute>
			<div className="fixed inset-0 overflow-hidden bg-[#1E1E1E] p-2 md:p-3">
				<div className="grid h-full grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
					{/* Left: Full-bleed multi-loop video */}
					<Card className="h-full overflow-hidden bg-black border-none">
						<CardContent className="h-full p-0">
							<div className="relative h-full w-full">
								{loading ? (
									<div className="absolute inset-0 flex items-center justify-center text-white">
										Loading videos...
									</div>
																) : videos.length > 0 ? (
																	<>
																		<VideoLooper
																			sources={videos}
																			crossfadeMs={600}
																			className="absolute inset-0 h-full w-full"
																			muted={false}
																			onActiveChange={(el) => setActiveMediaEl(el)}
																		/>
																		{/* Enable sound overlay for autoplay policies */}
																		{!audioEnabled && (
																			<div className="absolute bottom-4 left-4 z-10">
																				<button
																					className="px-4 py-2 rounded bg-[#FFD700] text-black font-semibold shadow"
																					onClick={() => {
																						setAudioEnabled(true);
																						if (activeMediaEl) {
																							try {
																								activeMediaEl.muted = false;
																								activeMediaEl.play().catch(() => {});
																							} catch {}
																						}
																					}}
																				>
																					Enable Sound
																				</button>
																			</div>
																		)}
																	</>
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-white">
										No videos found in /Avatar/
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Right: Scoreboards - 2x2 Grid on 4K */}
				<div className="h-full overflow-y-auto space-y-2">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
							<Board title="👑 Үдшийн гүнж" items={princess} />
							<Board title="🤴 Үдшийн ханхүү" items={prince} />
							<Board title="🧶 Хамгийн шилдэг Ugly Sweater" items={sweater} />
							<Board title="📝 Leaderboard" items={teams} />
						</div>
						
						{/* Audio Visualizer (reacts to active avatar video) */}
						<div className="flex items-center space-x-2">
							<img src="/Link.png" alt="QR Link" className="h-24 object-contain" />
							<AudioVisualizer analyser={activeAnalyser} />
						</div>
					</div>
				</div>
				
				{/* Warm Messages Display */}
				<WarmMessages />

				{/* Celebration Overlay (triggered via broadcast from control page) */}
				{celebration && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
						<div className="absolute h-72 w-72 animate-ping rounded-full bg-pink-500/30 blur-3xl" aria-hidden />
						<div className="relative max-w-3xl w-full bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
							<div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
								<span className="text-white text-lg font-semibold">{celebration.title}</span>
								<button
									onClick={() => {
									setCelebration(null);
									if (channelRef.current) channelRef.current.postMessage(null);
								}}
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
		</AdminRoute>
	);
}