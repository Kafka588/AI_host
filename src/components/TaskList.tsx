"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Task = {
  id: string;
  title: string;
  explanation: string;
  image_url: string | null;
  score: number;
  created_at: string;
};

type TaskListProps = {
  refreshTrigger?: number;
  showOnlyScanned?: boolean;
  showOnlyCompleted?: boolean;
  showQRCodes?: boolean;
};

export function TaskList({ refreshTrigger, showOnlyScanned = false, showOnlyCompleted = false, showQRCodes = false }: TaskListProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scannedTaskIds, setScannedTaskIds] = useState<string[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load tasks");
        return;
      }

      setTasks(data.tasks || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchScannedTasks = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/task-scans?userId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        setScannedTaskIds(data.scannedTasks || []);
      }
    } catch (err) {
      console.error("Failed to fetch scanned tasks:", err);
    }
  };

  const fetchCompletedTasks = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/submissions?userId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        const taskIds = data.submissions?.map((s: any) => s.task_id) || [];
        setCompletedTaskIds(taskIds);
      }
    } catch (err) {
      console.error("Failed to fetch completed tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchScannedTasks();
    fetchCompletedTasks();
  }, [refreshTrigger, user]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isScanned = scannedTaskIds.includes(task.id);
    const isCompleted = completedTaskIds.includes(task.id);

    if (showOnlyCompleted) {
      return matchesSearch && isCompleted;
    }
    if (showOnlyScanned) {
      return matchesSearch && isScanned;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-600 px-3 py-2 text-sm text-white">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No tasks available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search tasks by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-slate-700 bg-[#2d2d2d] border-none text-white placeholder:text-[#929292]"
      />

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No tasks match "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-[#FFD700] border-slate-600 hover:bg-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#c49216]">{task.title}</h3>
                      <span className="text-lg font-bold text-[#5e3b00]">+{task.score}</span>
                    </div>
                    <p className="text-sm text-[#917800] line-clamp-2 mb-2">
                      {task.explanation}
                    </p>
                    <p className="text-xs text-[#454545]">
                      Added: {new Date(task.created_at).toLocaleDateString()}
                    </p>
                    {showQRCodes && (
                      <div className="mt-3 flex flex-col items-start gap-2">
                        <div className="text-xs text-gray-400">Task ID: {task.id}</div>
                        <img
                          src={`/api/qr-codes?taskId=${task.id}`}
                          alt={`QR for ${task.title}`}
                          className="w-32 h-32 border-2 border-white rounded"
                        />
                        <a
                          href={`/api/qr-codes?taskId=${task.id}`}
                          download={`task-${task.title}-qr.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Download QR Code
                        </a>
                      </div>
                    )}
                  </div>
                  {task.image_url && !showQRCodes && (
                    <img
                      src={task.image_url}
                      alt={task.title}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </p>
    </div>
  );
}
