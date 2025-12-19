"use client";

import { AdminRoute } from "@/components/AdminRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VideoLooper } from "@/components/VideoLooper";
import { useEffect, useState } from "react";

const princess = [
	{ name: "Princess Nominee A", score: 95 },
	{ name: "Princess Nominee C", score: 88 },
	{ name: "Princess Nominee D", score: 80 },
];

const prince = [
	{ name: "Prince Nominee B", score: 92 },
	{ name: "Prince Nominee E", score: 86 },
	{ name: "Prince Nominee F", score: 77 },
];

const tasks = [
	{ name: "Team Alpha", score: 120 },
	{ name: "Team Beta", score: 110 },
	{ name: "Team Gamma", score: 98 },
];

function Board({
	title,
	items,
}: {
	title: string;
	items: { name: string; score: number }[];
}) {
	return (
		<Card className="w-full bg-[#363C4E]">
			<div className="px-4 text-xl font-bold text-white h-2">{title}</div>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[60px]">№</TableHead>
							<TableHead>Name</TableHead>
							<TableHead className="text-right">Score</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((item, i) => (
							<TableRow key={item.name}>
								<TableCell>
									<Badge variant="secondary" className="justify-center w-10">
										{i + 1}
									</Badge>
								</TableCell>
								<TableCell className="truncate text-white">{item.name}</TableCell>
								<TableCell className="text-right font-semibold text-purple-700">
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

	useEffect(() => {
		fetch("/api/avatar-videos")
			.then((res) => res.json())
			.then((data) => {
				const shuffled = shuffle((data.videos || []) as string[]);
				setVideos(shuffled);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, []);

	return (
		<AdminRoute>
			<div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 md:p-3">
				<div className="grid h-full grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
					{/* Left: Full-bleed multi-loop video */}
					<Card className="h-full overflow-hidden bg-black">
						<CardContent className="h-full p-0">
							<div className="relative h-full w-full">
								{loading ? (
									<div className="absolute inset-0 flex items-center justify-center text-white">
										Loading videos...
									</div>
								) : videos.length > 0 ? (
									<VideoLooper
										sources={videos}
										crossfadeMs={600}
										className="absolute inset-0 h-full w-full"
									/>
								) : (
									<div className="absolute inset-0 flex items-center justify-center text-white">
										No videos found in /Avatar/
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Right: Scoreboards (do not change) */}
					<div className="h-full overflow-y-auto space-y-2 md:space-y-3">
						<Board title="👑 Үдшийн ханхүү" items={princess} />
						<Board title="🤴 Үдшийн гүнж" items={prince} />
						<Board title="📝 Leaderboard" items={tasks} />
					</div>
				</div>
			</div>
		</AdminRoute>
	);
}