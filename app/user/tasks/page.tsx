"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskList } from "@/components/TaskList";
import { QRScanner } from "@/components/QRScanner";
import { TaskSubmitDialog } from "@/components/TaskSubmitDialog";

type ScannedTask = {
  id: string;
  title: string;
  explanation: string;
  image_url: string | null;
  is_public?: boolean;
};

export default function TasksPage() {
  const { user } = useAuth();
  const normalizeExplanation = (text: string) => {
    if (!text) return "";
    const trimmed = text.trim();
    const looksLikeCode = /objects|annotate|order_by|select|from|Count\(/i.test(trimmed);
    const parts = trimmed.split("/").map((p) => p.trim()).filter(Boolean);
    if (looksLikeCode && parts.length > 1) {
      return parts[parts.length - 1];
    }
    return trimmed;
  };

  const [scannerOpen, setScannerOpen] = useState(false);
  const [taskRefresh, setTaskRefresh] = useState(0);
  const [message, setMessage] = useState("");
  const [scannedTasks, setScannedTasks] = useState<ScannedTask[]>([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScannedTask | null>(null);
  const [publicTasks, setPublicTasks] = useState<ScannedTask[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [mediaViewOpen, setMediaViewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string>("");

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
          setUserSubmissions(submissionsData.submissions || []);
          // Hide tasks that already have a submission (pending/approved/rejected) to avoid duplicate uploads
          const submittedTaskIds = (submissionsData.submissions || []).map((s: any) => s.task_id);
          
          // Filter out already completed tasks
          const scanned = (tasksData.tasks || [])
            .filter((t: any) => taskIds.includes(t.id) && !submittedTaskIds.includes(t.id));
          setScannedTasks(scanned);

          // Compute public tasks (no QR required)
          const publics = (tasksData.tasks || [])
            .filter((t: any) => t.is_public && !submittedTaskIds.includes(t.id));
          setPublicTasks(publics);
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
    if (selectedTask) {
      setScannedTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setPublicTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setSelectedTask(null);
    }
    setMessage("✓ Task submitted successfully!");
    setTaskRefresh((p) => p + 1);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleViewMedia = (url: string) => {
    setSelectedMedia(url);
    setMediaViewOpen(true);
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
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#454545] p-4 rounded">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <p className="text-sm text-gray-400">{normalizeExplanation(task.explanation)}</p>
                </div>
                <Button
                  onClick={() => handleSubmitTask(task)}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto whitespace-nowrap"
                >
                  Submit Proof
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Public Tasks - No QR Required */}
      {publicTasks.length > 0 && (
        <Card className="bg-slate-800 bg-[#454545]">
          <CardHeader>
            <CardTitle className="text-white">Public Tasks - No QR Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {publicTasks.map((task) => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#454545] p-4 rounded">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <p className="text-sm text-gray-400">{normalizeExplanation(task.explanation)}</p>
                </div>
                <Button
                  onClick={() => handleSubmitTask(task)}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto whitespace-nowrap"
                >
                  Submit Proof
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks
      <Card className="bg-[#454545] border-none">
        <CardHeader>
          <CardTitle className="text-white">🎉 Accomplished Tasks - Points Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskList refreshTrigger={taskRefresh} showOnlyCompleted={true} />
        </CardContent>
      </Card> */}

      {/* Submission History */}
      <Card className="bg-[#454545] border-none">
        <CardHeader>
          <CardTitle className="text-white">📜 Submission History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userSubmissions.length === 0 ? (
            <div className="text-gray-400">No submissions yet</div>
          ) : (
            userSubmissions.map((s: any) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#454545] p-4 rounded border border-[#3a3a3a]">
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold truncate">{s.task_title}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(s.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {s.status === "approved" && <Badge className="bg-green-600">Approved</Badge>}
                  {s.status === "rejected" && <Badge className="bg-red-600">Rejected</Badge>}
                  {s.status === "pending" && <Badge variant="secondary">Pending</Badge>}
                  {s.proof_image && (
                    <Button
                      size="sm"
                      variant="link"
                      className="text-blue-400 p-0"
                      onClick={() => handleViewMedia(s.proof_image)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
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

      {/* Media Viewer */}
      <Dialog open={mediaViewOpen} onOpenChange={setMediaViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Proof</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            selectedMedia.match(/\.(mp4|mov|webm|avi)$/i) || selectedMedia.includes('video/') ? (
              <video src={selectedMedia} controls className="w-full h-auto rounded" preload="metadata">
                Your browser does not support video playback.
              </video>
            ) : (
              <img src={selectedMedia} alt="Proof" className="w-full h-auto rounded" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
