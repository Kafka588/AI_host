"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

type User = {
  id: string;
  username: string;
  sex: string;
  team: string;
  is_admin: boolean;
  profile_pic_url?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: "", sex: "", team: "" });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (response.ok) {
        // Filter out admin users
        const nonAdminUsers = (data.users || []).filter((u: User) => !u.is_admin);
        setUsers(nonAdminUsers);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({ username: user.username, sex: user.sex, team: user.team });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedUser.id, 
          username: editForm.username,
          sex: editForm.sex,
          team: editForm.team
        }),
      });
      if (response.ok) {
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id }),
      });
      if (response.ok) {
        setDeleteDialogOpen(false);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">View, edit, and manage all registered users</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading users...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Username</TableHead>
                  <TableHead className="text-gray-300">Sex</TableHead>
                  <TableHead className="text-gray-300">Team</TableHead>
                  <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {user.profile_pic_url ? (
                          <img 
                            src={user.profile_pic_url} 
                            alt={user.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">👤</div>
                        )}
                        <span>{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.sex === "male" ? "🙎‍♂️ Male" : "🙎‍♀️ Female"}
                    </TableCell>
                    <TableCell className="text-gray-300">{user.team || "No Team"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(user)}
                        className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label>Sex</Label>
                <select
                  value={editForm.sex}
                  onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <Label>Team</Label>
                <Input
                  value={editForm.team}
                  onChange={(e) => setEditForm({ ...editForm, team: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter team name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdateUser}
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updating ? "Updating..." : "Update"}
                </Button>
                <Button
                  onClick={() => setEditDialogOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to delete <strong>{selectedUser.username}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  variant="destructive"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
                <Button
                  onClick={() => setDeleteDialogOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}