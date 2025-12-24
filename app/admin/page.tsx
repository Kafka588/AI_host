"use client";

import { AdminRoute } from "@/components/AdminRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VideoLooper } from "@/components/VideoLooper";
import { WarmMessages } from "@/components/WarmMessages";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { useEffect, useState, useRef } from "react";

type Nominee = {
  name: string;
  score: number;
};

type Team = {
  name: string;
  score: number;
};

function Board({
	title,
	items,
}: {
	title: string;
	items: { name: string; score: number }[];
}) {
	return (
		<Card className="w-full bg-[#454545] border-none">
			<div className="px-6 text-2xl font-bold text-white h-2">{title}</div>
			<CardContent className="">
				<Table>
					<TableHeader>
						<TableRow className="text-[#929292]">
							<TableHead className="w-[80px] text-base">№</TableHead>
							<TableHead className="text-base">Name</TableHead>
							<TableHead className="text-right text-base">Score</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((item, i) => (
							<TableRow key={item.name}>
								<TableCell>
									<Badge variant="secondary" className="justify-center w-12 text-sm">
										{i + 1}
									</Badge>
								</TableCell>
								<TableCell className="truncate text-white text-lg">{item.name}</TableCell>
								<TableCell className="text-right font-semibold text-[#FFD700] text-lg">
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
						}));

					const princeList = nominees
						.filter((n: any) => n.category === "prince")
						.sort((a: any, b: any) => b.voteCount - a.voteCount)
						.map((n: any) => ({
							name: n.name,
							score: n.voteCount,
						}));

					const sweaterList = nominees
						.filter((n: any) => n.category === "ugly_sweater")
						.sort((a: any, b: any) => b.voteCount - a.voteCount)
						.map((n: any) => ({
							name: n.name,
							score: n.voteCount,
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
					<div className="h-full overflow-y-auto space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
							<Board title="👑 Үдшийн ханхүү" items={princess} />
							<Board title="🤴 Үдшийн гүнж" items={prince} />
							<Board title="🧶 Хамгийн сайхан свитер" items={sweater} />
							<Board title="📝 Leaderboard" items={teams} />
						</div>
						
						{/* Audio Visualizer (reacts to active avatar video) */}
						<AudioVisualizer analyser={activeAnalyser} />
					</div>
				</div>
				
				{/* Warm Messages Display */}
				<WarmMessages />
			</div>
		</AdminRoute>
	);
}