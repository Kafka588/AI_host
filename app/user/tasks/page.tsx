"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/TaskList";
import { QRScanner } from "@/components/QRScanner";
import { TaskSubmitDialog } from "@/components/TaskSubmitDialog";

type ScannedTask = {
  id: string;
  title: string;
  explanation: string;
  image_url: string | null;
};

export default function TasksPage() {
  const { user } = useAuth();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [taskRefresh, setTaskRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const [scannedTasks, setScannedTasks] = useState<ScannedTask[]>([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScannedTask | null>(null);

  useEffect(() => {
    fetchScannedTasks();
  }, [taskRefresh, user]);

  const fetchScannedTasks = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/task-scans?userId=${user.id}`);
      const data = await response.json();
      if (response.ok) {
        const taskIds = data.scannedTasks || [];
        // Fetch task details for each scanned task
        const tasksResponse = await fetch("/api/tasks");
        const tasksData = await tasksResponse.json();
        if (tasksResponse.ok) {
          // Fetch user submissions to filter out already completed tasks
          const submissionsResponse = await fetch(`/api/submissions?userId=${user.id}`);
          const submissionsData = await submissionsResponse.json();
          const approvedTaskIds = (submissionsData.submissions || [])
            .filter((s: any) => s.status === "approved")
            .map((s: any) => s.task_id);
          
          // Filter out already completed tasks
          const scanned = (tasksData.tasks || [])
            .filter((t: any) => taskIds.includes(t.id) && !approvedTaskIds.includes(t.id));
          setScannedTasks(scanned);
        }
      }
    } catch (err) {
      console.error("Failed to fetch scanned tasks:", err);
    }
  };

  const handleScan = async (taskId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/task-scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, taskId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✓ Task unlocked! You can now complete it.");
        setTaskRefresh((p) => p + 1);
        setScannerOpen(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`Error: ${data.error}`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("Failed to unlock task");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSubmitTask = (task: ScannedTask) => {
    setSelectedTask(task);
    setSubmitDialogOpen(true);
  };

  const handleSubmitSuccess = () => {
    setMessage("✓ Task submitted successfully!");
    setTaskRefresh((p) => p + 1);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">📋 Tasks</h1>
        <p className="text-gray-400">Scan QR codes to unlock and complete tasks</p>
      </div>

      <Button
        onClick={() => setScannerOpen(true)}
        className="bg-[#FFD700] hover:bg-[#5e3b00] w-full text-[#5e3b00] hover:text-[#FFD700] font-bold"
      >
        Даалгавар нэмэх
      </Button>

      {message && (
        <div className={`p-3 rounded text-sm ${
          message.startsWith("✓")
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}>
          {message}
        </div>
      )}

      {/* Unlocked Tasks - Ready to Submit */}
      {scannedTasks.length > 0 && (
        <Card className="bg-slate-800 bg-[#454545]">
          <CardHeader>
            <CardTitle className="text-white">Unlocked Tasks - Submit Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scannedTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-[#454545] p-4 rounded">
                <div>
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <p className="text-sm text-gray-400">{task.explanation}</p>
                </div>
                <Button
                  onClick={() => handleSubmitTask(task)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Proof
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      <Card className="bg-[#454545] border-none">
        <CardHeader>
          <CardTitle className="text-white">🎉 Accomplished Tasks - Points Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList refreshTrigger={taskRefresh} showOnlyCompleted={true} />
        </CardContent>
      </Card>

      <QRScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScan}
      />

      {selectedTask && (
        <TaskSubmitDialog
          open={submitDialogOpen}
          onOpenChange={setSubmitDialogOpen}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
