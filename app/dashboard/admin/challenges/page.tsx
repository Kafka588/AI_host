"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const dummyChallenges = [
  { id: "1", user: "alice123", task: "Dance Challenge", status: "pending", proof: "photo1.jpg" },
  { id: "2", user: "bob456", task: "Sing a Song", status: "approved", proof: "video1.mp4" },
  { id: "3", user: "carol789", task: "Tell a Joke", status: "rejected", proof: "audio1.mp3" },
  { id: "4", user: "dave111", task: "Team Photo", status: "pending", proof: "photo2.jpg" },
];

export default function ChallengesPage() {
  const handleApprove = (challengeId: string) => {
    console.log("Approve challenge:", challengeId);
  };

  const handleReject = (challengeId: string) => {
    console.log("Reject challenge:", challengeId);
  };

  const handleViewProof = (proof: string) => {
    console.log("View proof:", proof);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Challenge Management</h1>
        <p className="text-gray-400">Review and approve user-submitted challenges</p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Submissions ({dummyChallenges.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Task</TableHead>
                <TableHead className="text-gray-300">Proof</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyChallenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium text-white">{challenge.user}</TableCell>
                  <TableCell className="text-gray-300">{challenge.task}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => handleViewProof(challenge.proof)}
                      className="text-blue-400 p-0"
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    {challenge.status === "approved" && (
                      <Badge className="bg-green-600">Approved</Badge>
                    )}
                    {challenge.status === "rejected" && (
                      <Badge className="bg-red-600">Rejected</Badge>
                    )}
                    {challenge.status === "pending" && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {challenge.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(challenge.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(challenge.id)}
                        >
                          ✗ Reject
                        </Button>
                      </>
                    )}
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