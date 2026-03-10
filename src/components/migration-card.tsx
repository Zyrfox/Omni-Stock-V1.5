"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatabaseZap, CheckCircle2, Loader2, Lock } from "lucide-react";

interface MigrationCardProps {
  isMigrationDone: boolean;
}

export function MigrationCard({ isMigrationDone: initialDone }: MigrationCardProps) {
  const [isDone, setIsDone] = useState(initialDone);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleMigration() {
    if (isDone) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/migration", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setIsDone(true);
        setResult(`Migration berhasil! ${data.message || ""}`);
      } else {
        setResult(`Error: ${data.error || "Migration gagal"}`);
      }
    } catch {
      setResult("Error: Koneksi gagal. Periksa jaringan Anda.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={isDone ? "border-green-200 bg-green-50/50" : "border-blue-200 bg-blue-50/50"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isDone ? "bg-green-100" : "bg-blue-100"}`}>
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <DatabaseZap className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">One-Way Bridge</CardTitle>
              <CardDescription>Migrasi Master Data dari Google Sheets</CardDescription>
            </div>
          </div>
          <Badge variant={isDone ? "safe" : "outline"}>
            {isDone ? "Migration Complete" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {isDone
            ? "Migrasi data dari Google Sheets telah selesai. Tombol ini telah dikunci secara permanen."
            : "Sinkronisasi data sys_outlets, pawoon_products, dan mapping_pawoon dari Google Sheets. Aksi ini hanya dapat dilakukan SATU KALI."}
        </p>
        <Button
          onClick={handleMigration}
          disabled={isDone || isLoading}
          className={isDone ? "bg-gray-400 cursor-not-allowed" : ""}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses Migrasi...
            </>
          ) : isDone ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Migration Complete
            </>
          ) : (
            <>
              <DatabaseZap className="mr-2 h-4 w-4" />
              Sync from GSheet
            </>
          )}
        </Button>
        {result && (
          <p className={`text-sm ${result.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
            {result}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
