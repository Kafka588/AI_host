"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runMigration = async (dryRun: boolean) => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/migrate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        error: (error as Error).message,
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Image Migration to R2
        </h1>
        <p className="text-gray-400">
          Migrate all images from Supabase/base64 to Cloudflare R2
        </p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Migration Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => runMigration(true)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🧪 Dry Run (Test Only)
            </Button>
            <Button
              onClick={() => runMigration(false)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              🚀 Run Migration
            </Button>
          </div>

          {loading && (
            <div className="text-yellow-400">⏳ Processing migration...</div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Results
              {results.success ? (
                <Badge className="bg-green-600">Success</Badge>
              ) : (
                <Badge className="bg-red-600">Failed</Badge>
              )}
              {results.dryRun && (
                <Badge className="bg-blue-600">Dry Run</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.error ? (
              <div className="text-red-400">❌ Error: {results.error}</div>
            ) : (
              <>
                <div className="text-green-400">
                  ✅ {results.message}
                </div>

                {results.results && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900 p-4 rounded">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        📝 Tasks
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white">
                            {results.results.tasks.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Migrated:</span>
                          <span className="text-green-400">
                            {results.results.tasks.migrated}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-400">Skipped:</span>
                          <span className="text-yellow-400">
                            {results.results.tasks.skipped}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">Failed:</span>
                          <span className="text-red-400">
                            {results.results.tasks.failed}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        📸 Submissions
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white">
                            {results.results.submissions.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Migrated:</span>
                          <span className="text-green-400">
                            {results.results.submissions.migrated}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-400">Skipped:</span>
                          <span className="text-yellow-400">
                            {results.results.submissions.skipped}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">Failed:</span>
                          <span className="text-red-400">
                            {results.results.submissions.failed}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        👤 Profiles
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white">
                            {results.results.profiles.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Migrated:</span>
                          <span className="text-green-400">
                            {results.results.profiles.migrated}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-400">Skipped:</span>
                          <span className="text-yellow-400">
                            {results.results.profiles.skipped}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">Failed:</span>
                          <span className="text-red-400">
                            {results.results.profiles.failed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {results.results?.errors?.length > 0 && (
                  <div className="bg-red-900/20 p-4 rounded">
                    <h4 className="text-red-400 font-semibold mb-2">
                      Errors:
                    </h4>
                    <ul className="text-sm text-red-300 space-y-1">
                      {results.results.errors.map((err: string, i: number) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">📚 Documentation</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-2 text-sm">
          <p>
            <strong>Dry Run:</strong> Tests migration without making changes.
            Shows what would happen.
          </p>
          <p>
            <strong>Run Migration:</strong> Actually migrates images to R2 and
            updates database URLs.
          </p>
          <p>
            <strong>Skipped:</strong> Images already on R2 or non-base64 URLs.
          </p>
          <p className="text-yellow-400">
            ⚠️ Run during low-traffic hours. Large migrations may take time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
