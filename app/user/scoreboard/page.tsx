"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

function Board({ title, items }: { title: string; items: { name: string; score: number }[] }) {
  return (
    <Card className="w-full bg-white/95">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-lg border px-4 py-3 bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center font-semibold">
                {i + 1}
              </div>
              <div>
                <div className="font-semibold text-black">{item.name}</div>
                <div className="text-sm text-black">Оноо</div>
              </div>
            </div>
            <div className="text-xl font-bold text-black">{item.score}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ScoreboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4 pt-6  text-black">
      <Board title="👑 Princess of the Night" items={princess} /> 
      <Board title="🤴 Prince of the Night  text-black" items={prince} />
      <Board title="📝 Tasks Leaderboard" items={tasks} />
    </div>
  );
}