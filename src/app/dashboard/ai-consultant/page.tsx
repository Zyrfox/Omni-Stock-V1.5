"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Brain, Loader2, Sparkles } from "lucide-react";
import type { StockStatus } from "@/lib/utils";

interface Recommendation {
  id: string;
  nama: string;
  tipeBahan: string;
  status: StockStatus;
  action: string;
  aiText: string;
}

interface AIResult {
  recommendations: Recommendation[];
  summary: { total: number; critical: number; warning: number; safe: number };
}

export default function AIConsultantPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Gagal menghubungi AI Engine.");
    } finally {
      setIsLoading(false);
    }
  }

  const statusVariant = (s: StockStatus) =>
    s === "SAFE" ? "safe" as const : s === "WARNING" ? "warning" as const : "critical" as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          AI Consultant Dashboard
        </h1>
        <p className="text-muted-foreground">
          Analisis prediktif dan rekomendasi pemesanan berdasarkan data stok, lead time, dan konsumsi harian
        </p>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Jalankan Analisis AI
          </CardTitle>
          <CardDescription>
            AI akan menganalisis seluruh data bahan baku dan memberikan rekomendasi Order Now / Safe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAnalysis} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI Sedang Menganalisis...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Mulai Analisis
              </>
            )}
          </Button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{result.summary.total}</div>
                <p className="text-xs text-muted-foreground">Total Item</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-700">{result.summary.critical}</div>
                <p className="text-xs text-muted-foreground">Critical</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-700">{result.summary.warning}</div>
                <p className="text-xs text-muted-foreground">Warning</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-700">{result.summary.safe}</div>
                <p className="text-xs text-muted-foreground">Safe</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Per-Item</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Rekomendasi AI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.recommendations.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-mono text-xs">{rec.id}</TableCell>
                      <TableCell className="font-medium">{rec.nama}</TableCell>
                      <TableCell>
                        <Badge variant={rec.tipeBahan === "raw_bulk" ? "warning" : "outline"}>
                          {rec.tipeBahan === "raw_bulk" ? "Raw/Bulk" : "Packaged"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(rec.status)}>{rec.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rec.action === "Safe" ? "safe" : "critical"}>
                          {rec.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md text-sm whitespace-pre-wrap">{rec.aiText}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </>
      )}
    </div>
  );
}
