"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "@/components/TaskForm";
import { EditTaskForm } from "@/components/EditTaskForm";
import { TaskList } from "@/components/TaskList";
import { useState, useEffect } from "react";

type Submission = {
  id: string;
  user_id: string;
  user_name: string;
  user_profile_pic: string | null;
  task_id: string;
  task_title: string;
  proof_image: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type Task = {
  id: string;
  title: string;
  explanation: string;
  image_url: string | null;
  score: number;
  is_public?: boolean;
};

export default function ChallengesPage() {
  const [taskRefresh, setTaskRefresh] = useState(0);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [viewTasksOpen, setViewTasksOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageViewOpen, setImageViewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const fetchSubmissions = async () => {
    const isRefreshing = refreshing;
    if (!isRefreshing) setLoading(true);
    try {
      const response = await fetch("/api/submissions");
      const data = await response.json();
      console.log("Fetched submissions:", data);
      if (response.ok) {
        setSubmissions(data.submissions || []);
      } else {
        console.error("Error fetching submissions:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchTasks();
    // Only fetch once on mount - no auto-refresh
  }, []);

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-status", id: submissionId, status: "approved" }),
      });
      if (response.ok) {
        fetchSubmissions();
      }
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-status", id: submissionId, status: "rejected" }),
      });
      if (response.ok) {
        fetchSubmissions();
      }
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  const handleViewProof = (proof: string) => {
    setSelectedImage(proof);
    setImageViewOpen(true);
  };

  const downloadMedia = (url: string, filename: string) => {
    // Create a hidden link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadQRCode = async (taskId: string, taskTitle: string) => {
    try {
      const response = await fetch(`/api/qr-codes?taskId=${taskId}`);
      const data = await response.json();
      if (response.ok && data.url) {
        downloadMedia(data.url, `task-${taskTitle}-qr.png`);
      } else {
        console.error("Failed to generate QR code:", data.error);
      }
    } catch (err) {
      console.error("QR download error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Challenges & Tasks</h1>
        <p className="text-gray-400">Manage tasks and review user-submitted challenge submissions</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Add New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm onTaskAdded={() => {
              setTaskRefresh((p) => p + 1);
              fetchTasks();
              setAddTaskOpen(false);
            }} />
          </DialogContent>
        </Dialog>

        <Dialog open={viewTasksOpen} onOpenChange={setViewTasksOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">👁 View Available Tasks</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Available Tasks with QR Codes & Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.map((task) => {
                // Count submissions for this task
                const taskSubmissions = submissions.filter((s) => s.task_id === task.id);
                const approvedCount = taskSubmissions.filter((s) => s.status === "approved").length;
                const pendingCount = taskSubmissions.filter((s) => s.status === "pending").length;
                
                return (
                  <div key={task.id} className="bg-slate-700 p-4 rounded border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{task.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">ID: {task.id}</p>
                      </div>
                      <span className="text-lg font-bold text-yellow-400">+{task.score}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{task.explanation}</p>
                    {task.image_url && (
                      <img src={task.image_url} alt={task.title} className="w-full h-40 object-cover rounded mb-3" />
                    )}
                    <div className="flex gap-2 text-xs mb-3">
                      <Badge variant="secondary" className="bg-green-900">{approvedCount} ✓ Approved</Badge>
                      <Badge variant="secondary" className="bg-yellow-900">{pendingCount} ⏳ Pending</Badge>
                      <Badge variant="secondary" className="bg-blue-900">{taskSubmissions.length} Total</Badge>
                      <Badge variant="secondary" className={task.is_public ? "bg-green-800" : "bg-gray-700"}>
                        {task.is_public ? "Public" : "QR Only"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-400"
                        onClick={() => {
                          setEditingTask(task);
                          setEditTaskOpen(true);
                        }}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={task.is_public ? "border-green-600 text-green-400" : "border-gray-600 text-gray-300"}
                        onClick={async () => {
                          const res = await fetch('/api/tasks', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'update-visibility', taskId: task.id, isPublic: !task.is_public }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            // refresh tasks list to reflect change
                            fetchTasks();
                          } else {
                            console.error('Visibility update failed:', data.error);
                          }
                        }}
                      >
                        {task.is_public ? 'Make QR-only' : 'Make Public'}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 w-full"
                      onClick={() => downloadQRCode(task.id, task.title)}
                    >
                      📥 Download QR Code
                    </Button>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={() => {
            setRefreshing(true);
            fetchSubmissions();
          }}
          variant="outline"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </Button>
      </div>

      {/* Task Acceptance/Submissions Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Task Submissions ({submissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No submissions yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Task</TableHead>
                  <TableHead className="text-gray-300">Submitted</TableHead>
                  <TableHead className="text-gray-300">Image</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => {
                  // Check if this is the first submission for this task
                  const isFirstSubmission = submissions.findIndex(
                    (s) => s.task_id === submission.task_id
                  ) === submissions.indexOf(submission);

                  return (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
                            {submission.user_profile_pic ? (
                              <img src={submission.user_profile_pic} alt={submission.user_name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">👤</div>
                            )}
                          </div>
                          <span>{submission.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{submission.task_title}</TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {new Date(submission.created_at).toLocaleString()}
                        {isFirstSubmission && submission.status === "pending" && (
                          <div className="text-xs text-yellow-400 mt-1">⭐ First</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => handleViewProof(submission.proof_image)}
                            className="text-blue-400 p-0"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => {
                              const ext = submission.proof_image.match(/\.(mp4|mov|webm|avi)$/i) ? 'video' : 'image';
                              const filename = `${submission.user_name}-${submission.task_title}-${Date.now()}.${ext === 'video' ? 'mp4' : 'jpg'}`;
                              downloadMedia(submission.proof_image, filename);
                            }}
                            className="text-green-400 p-0"
                          >
                            ⬇️
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.status === "approved" && (
                          <Badge className="bg-green-600">Approved</Badge>
                        )}
                        {submission.status === "rejected" && (
                          <Badge className="bg-red-600">Rejected</Badge>
                        )}
                        {submission.status === "pending" && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {submission.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(submission.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(submission.id)}
                            >
                              ✗ Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Media Viewer Modal */}
      <Dialog open={imageViewOpen} onOpenChange={setImageViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>View Proof</DialogTitle>
              {selectedImage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const ext = selectedImage.match(/\.(mp4|mov|webm|avi)$/i) ? 'mp4' : 'jpg';
                    const filename = `submission-${Date.now()}.${ext}`;
                    downloadMedia(selectedImage, filename);
                  }}
                  className="text-green-500 border-green-500 hover:bg-green-500/10"
                >
                  📥 Download
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedImage && (
            selectedImage.match(/\.(mp4|mov|webm|avi)$/i) || selectedImage.includes('video/') ? (
              <video 
                src={selectedImage} 
                controls 
                className="w-full h-auto rounded"
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <img src={selectedImage} alt="Proof" className="w-full h-auto rounded" />
            )
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <EditTaskForm 
              task={editingTask}
              onTaskUpdated={() => {
                setEditTaskOpen(false);
                setEditingTask(null);
                fetchTasks();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}