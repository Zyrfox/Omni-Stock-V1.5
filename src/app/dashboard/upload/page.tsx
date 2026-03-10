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
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import type { StockStatus } from "@/lib/utils";

interface ParsedItem {
  id: string;
  namaBahan: string;
  stokAkhir: number;
  stokMinimum: number;
  status: StockStatus;
  statusEmoji: string;
  vendor: string;
  actionPO: string;
  satuanDapur: string;
  daysUntilStockout: number | null;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ParsedItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState<Record<string, string>>({});

  async function handleUpload() {
    if (!file) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-excel", { method: "POST", body: formData });
      const result = await res.json();

      if (res.ok) {
        setData(result.data);
        setMessage(result.message);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch {
      setMessage("Error: Gagal mengupload file.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAIAnalysis() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bahanIds: data.map((d) => d.id).filter((id) => id !== "-") }),
      });
      const result = await res.json();
      if (result.recommendations) {
        const recs: Record<string, string> = {};
        for (const rec of result.recommendations) {
          recs[rec.id] = rec.shortRec;
        }
        setAiRecs(recs);
      }
    } catch {
      // AI failed silently
    } finally {
      setAiLoading(false);
    }
  }

  const statusVariant = (s: StockStatus) =>
    s === "SAFE" ? "safe" as const : s === "WARNING" ? "warning" as const : "critical" as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Data Pawoon</h1>
        <p className="text-muted-foreground">
          Upload file Excel (.xls/.xlsx) dari Pawoon POS untuk sinkronisasi stok
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload File Excel
          </CardTitle>
          <CardDescription>
            Format kolom yang didukung: nama_bahan, stok_akhir (atau Nama Bahan, Stok Akhir)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
            <Button onClick={handleUpload} disabled={!file || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Parse
                </>
              )}
            </Button>
          </div>
          {message && (
            <p className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hasil Penjabaran Bahan</CardTitle>
                <CardDescription>{data.length} item berhasil di-parse</CardDescription>
              </div>
              <Button onClick={handleAIAnalysis} disabled={aiLoading} variant="outline">
                {aiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  "Minta Rekomendasi AI"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead className="text-right">Stok Akhir</TableHead>
                  <TableHead className="text-right">Stok Minimum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Action PO</TableHead>
                  <TableHead>AI Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.namaBahan}</TableCell>
                    <TableCell className="text-right">
                      {item.stokAkhir} {item.satuanDapur}
                    </TableCell>
                    <TableCell className="text-right">{item.stokMinimum}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>
                        {item.statusEmoji} {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.vendor}</TableCell>
                    <TableCell>
                      <Badge variant={item.actionPO === "Safe" ? "safe" : "critical"}>
                        {item.actionPO}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground">
                      {aiRecs[item.id] || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
