"use client";

import { useState, useEffect } from "react";
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
import { ShoppingCart, Loader2, Send, CheckCircle } from "lucide-react";

interface PO {
  id: string;
  outletId: string;
  vendorId: string;
  bahanId: string;
  status: "draft" | "sent" | "received";
  qtyOrder: number;
  hargaSatuan: number;
  totalHarga: number;
  aiNotes: string | null;
  tanggalKirim: string | null;
  tanggalTerima: string | null;
  createdAt: string;
}

export default function PurchaseOrdersPage() {
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchPOs() {
    try {
      const res = await fetch("/api/purchase-orders");
      const data = await res.json();
      if (data.data) setPOs(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPOs();
  }, []);

  async function handleAction(id: string, action: "send" | "receive") {
    setActionLoading(id);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) await fetchPOs();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  const statusColor = (s: string) => {
    if (s === "draft") return "warning" as const;
    if (s === "sent") return "default" as const;
    return "safe" as const;
  };

  const drafts = pos.filter((p) => p.status === "draft");
  const sent = pos.filter((p) => p.status === "sent");
  const received = pos.filter((p) => p.status === "received");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Purchase Orders
        </h1>
        <p className="text-muted-foreground">
          Kelola pengadaan bahan baku: Draft → Sent → Received
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-700">{drafts.length}</div>
            <p className="text-xs text-muted-foreground">Draft PO</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-700">{sent.length}</div>
            <p className="text-xs text-muted-foreground">Terkirim</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700">{received.length}</div>
            <p className="text-xs text-muted-foreground">Diterima</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Purchase Order ({pos.length})</CardTitle>
          <CardDescription>
            Klik Kirim PO untuk mengunci draft, atau Konfirmasi Terima untuk update stok
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pos.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Belum ada Purchase Order. Buat PO dari halaman AI Consultant.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Bahan</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Notes</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pos.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">{po.id}</TableCell>
                    <TableCell>{po.bahanId}</TableCell>
                    <TableCell>{po.vendorId}</TableCell>
                    <TableCell className="text-right">{po.qtyOrder}</TableCell>
                    <TableCell className="text-right">
                      Rp {po.hargaSatuan?.toLocaleString("id-ID") || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {po.totalHarga?.toLocaleString("id-ID") || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(po.status)}>
                        {po.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-muted-foreground truncate">
                      {po.aiNotes || "-"}
                    </TableCell>
                    <TableCell>
                      {po.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === po.id}
                          onClick={() => handleAction(po.id, "send")}
                        >
                          {actionLoading === po.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="mr-1 h-3 w-3" />
                              Kirim
                            </>
                          )}
                        </Button>
                      )}
                      {po.status === "sent" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700"
                          disabled={actionLoading === po.id}
                          onClick={() => handleAction(po.id, "receive")}
                        >
                          {actionLoading === po.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Terima
                            </>
                          )}
                        </Button>
                      )}
                      {po.status === "received" && (
                        <span className="text-xs text-green-600">Selesai</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
