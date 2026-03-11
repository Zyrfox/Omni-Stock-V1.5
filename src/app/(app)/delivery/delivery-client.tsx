"use client";

import { useState } from "react";
import { Truck, Clock, CheckCircle2 } from "lucide-react";

interface Delivery {
  id: string;
  status: string;
  qtyOrder: number;
  totalHarga: number;
  tanggalKirim: string | null;
  tanggalTerima: string | null;
  createdAt: string;
  namaVendor: string;
  estimasiPengiriman: number;
  namaBahan: string;
  satuanBeli: string;
  namaOutlet: string;
}

interface Props {
  inTransit: number;
  pending: number;
  delivered: number;
  deliveries: Delivery[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const card = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "18px",
} as const;

function getETA(delivery: Delivery): string {
  if (delivery.tanggalTerima) return fmtDate(delivery.tanggalTerima);
  const base = delivery.tanggalKirim ?? delivery.createdAt;
  const eta = new Date(base);
  eta.setDate(eta.getDate() + delivery.estimasiPengiriman);
  return fmtDate(eta.toISOString());
}

export function DeliveryClient({ inTransit, pending, delivered, deliveries }: Props) {
  const [deliveryList, setDeliveryList] = useState<Delivery[]>(deliveries);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const counts = {
    inTransit: deliveryList.filter(d => d.status === "sent").length,
    pending: deliveryList.filter(d => d.status === "draft").length,
    delivered: deliveryList.filter(d => d.status === "received").length,
  };

  const statCards = [
    { label: "In Transit", value: counts.inTransit, icon: Truck, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "PO dikirim" },
    { label: "Pending", value: counts.pending, icon: Clock, color: "hsl(var(--amber))", bg: "rgba(245,158,11,0.1)", sub: "PO belum dikirim" },
    { label: "Delivered", value: counts.delivered, icon: CheckCircle2, color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)", sub: "PO diterima" },
  ];

  // suppress unused param warnings from initial props
  void inTransit; void pending; void delivered;

  async function handleAction(d: Delivery, action: "send" | "receive") {
    setLoadingId(d.id);
    setError("");
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: d.id, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui PO");
      const newStatus = action === "send" ? "sent" : "received";
      setDeliveryList(prev => prev.map(item => item.id === d.id ? { ...item, status: newStatus } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Delivery Tracking</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>Monitor status pengiriman Purchase Order</p>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "hsl(var(--red))", fontSize: "13px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{error}</span>
          <button onClick={() => setError("")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--red))" }}>×</button>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {statCards.map((sc) => (
          <div key={sc.label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{sc.label}</p>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "hsl(var(--text))", lineHeight: 1 }}>{sc.value}</p>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted))", marginTop: "4px" }}>{sc.sub}</p>
              </div>
              <div style={{ background: sc.bg, borderRadius: "10px", padding: "10px" }}>
                <sc.icon style={{ width: 20, height: 20, color: sc.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ marginBottom: "14px" }}>
          <span style={{ fontWeight: 700, fontSize: "13px" }}>Delivery Log</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["DEL ID", "PO ID", "Vendor", "Bahan", "Qty", "ETA", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliveryList.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada data pengiriman.</td></tr>
              ) : (
                deliveryList.map((d, idx) => {
                  const delNum = String(idx + 1).padStart(3, "0");
                  const statusColor = d.status === "received"
                    ? { color: "hsl(var(--green))", bg: "rgba(34,197,94,0.15)", label: "Delivered" }
                    : d.status === "sent"
                      ? { color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.15)", label: "In Transit" }
                      : { color: "hsl(var(--amber))", bg: "rgba(245,158,11,0.15)", label: "Pending" };

                  return (
                    <tr
                      key={d.id}
                      style={{ borderTop: "1px solid hsl(var(--border))" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--muted))" }}>
                        DEL-{delNum}
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--accent))", fontWeight: 700 }}>
                        {d.id}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{d.namaVendor}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{d.namaBahan}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{d.qtyOrder} {d.satuanBeli}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{getETA(d)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: statusColor.bg, color: statusColor.color }}>
                          {statusColor.label}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {d.status === "sent" && (
                          <button
                            disabled={loadingId === d.id}
                            onClick={() => handleAction(d, "receive")}
                            style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))", fontWeight: 600, opacity: loadingId === d.id ? 0.6 : 1 }}
                          >
                            {loadingId === d.id ? "..." : "Konfirmasi Terima"}
                          </button>
                        )}
                        {d.status === "received" && (
                          <span style={{ fontSize: "11px", color: "hsl(var(--green))", fontWeight: 600 }}>✓ Selesai</span>
                        )}
                        {d.status === "draft" && (
                          <button
                            disabled={loadingId === d.id}
                            onClick={() => handleAction(d, "send")}
                            style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(245,158,11,0.15)", color: "hsl(var(--amber))", fontWeight: 600, opacity: loadingId === d.id ? 0.6 : 1 }}
                          >
                            {loadingId === d.id ? "..." : "Kirim"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
