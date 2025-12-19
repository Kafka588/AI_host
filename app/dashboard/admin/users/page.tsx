"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const dummyUsers = [
  { id: "1", username: "alice123", sex: "female", team: "team1", is_admin: false },
  { id: "2", username: "bob456", sex: "male", team: "team2", is_admin: false },
  { id: "3", username: "carol789", sex: "female", team: "team3", is_admin: false },
  { id: "4", username: "admin", sex: "male", team: "team1", is_admin: true },
  { id: "5", username: "dave111", sex: "male", team: "team1", is_admin: false },
];

export default function UsersPage() {
  const handleEdit = (userId: string) => {
    console.log("Edit user:", userId);
  };

  const handleDelete = (userId: string) => {
    console.log("Delete user:", userId);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">View, edit, and manage all registered users</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Users ({dummyUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Username</TableHead>
                <TableHead className="text-gray-300">Sex</TableHead>
                <TableHead className="text-gray-300">Team</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-white">{user.username}</TableCell>
                  <TableCell className="text-gray-300">
                    {user.sex === "male" ? "🙎‍♂️ Male" : "🙎‍♀️ Female"}
                  </TableCell>
                  <TableCell className="text-gray-300">{user.team}</TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="destructive">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user.id)}
                      className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(user.id)}
                      className="text-red-400 border-red-400 hover:bg-red-400/10"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}