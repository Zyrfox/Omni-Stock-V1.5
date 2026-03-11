"use client";

import { useState } from "react";
import { ShoppingCart, Send, CheckCircle2, FileText, X, Clock } from "lucide-react";

interface PO {
  id: string;
  status: string;
  qtyOrder: number;
  hargaSatuan: number;
  totalHarga: number;
  aiNotes: string | null;
  tanggalKirim: string | null;
  tanggalTerima: string | null;
  createdAt: string;
  createdBy: string | null;
  outletId: string;
  namaVendor: string;
  namaBahan: string;
  satuanBeli: string;
  namaOutlet: string;
}

interface Props {
  totalPO: number;
  draftCount: number;
  sentCount: number;
  receivedCount: number;
  poList: PO[];
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: "DRAFT", color: "#6B7280", bg: "rgba(107,114,128,0.15)" },
    sent: { label: "SENT", color: "hsl(var(--amber))", bg: "rgba(245,158,11,0.15)" },
    received: { label: "RECEIVED", color: "hsl(var(--green))", bg: "rgba(34,197,94,0.15)" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "4px", padding: "2px 7px", fontSize: "10px", fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function Timeline({ status }: { status: string }) {
  const steps = ["draft", "sent", "received"];
  const labels = ["DRAFT", "SENT", "RECEIVED"];
  const activeIdx = steps.indexOf(status);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", margin: "20px 0" }}>
      {steps.map((step, i) => {
        const done = i <= activeIdx;
        const active = i === activeIdx;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", border: `2px solid ${done ? "hsl(var(--accent))" : "hsl(var(--border2))"}`,
                background: done ? "hsl(var(--accent))" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: done ? "#0A0A0F" : "hsl(var(--muted))",
                fontWeight: 800, fontSize: "12px",
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: done ? "hsl(var(--text))" : "hsl(var(--muted))", marginTop: "4px", textAlign: "center" }}>
                {labels[i]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: "2px", background: i < activeIdx ? "hsl(var(--accent))" : "hsl(var(--border2))", margin: "0 4px", marginBottom: "20px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function POLogsClient({ totalPO, draftCount, sentCount, receivedCount, poList }: Props) {
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const statCards = [
    { label: "Total PO", value: totalPO, icon: ShoppingCart, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Semua PO" },
    { label: "Draft", value: draftCount, icon: FileText, color: "hsl(var(--muted))", bg: "rgba(107,114,128,0.1)", sub: "Belum dikirim" },
    { label: "Sent", value: sentCount, icon: Send, color: "hsl(var(--amber))", bg: "rgba(245,158,11,0.1)", sub: "Menunggu konfirmasi" },
    { label: "Received", value: receivedCount, icon: CheckCircle2, color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)", sub: "Diterima" },
  ];

  const filtered = filterStatus === "all" ? poList : poList.filter((p) => p.status === filterStatus);

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>PO Logs</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>Manajemen Purchase Order dan tracking pengiriman</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {statCards.map((sc) => (
          <div
            key={sc.label}
            style={{ ...card, cursor: "pointer" }}
            onClick={() => setFilterStatus(sc.label === "Total PO" ? "all" : sc.label.toLowerCase())}
          >
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 700, fontSize: "13px" }}>Purchase Orders</span>
            {filterStatus !== "all" && (
              <span style={{
                fontSize: "10px", padding: "2px 8px", borderRadius: "4px", cursor: "pointer",
                background: "rgba(200,241,53,0.15)", color: "hsl(var(--accent))",
              }} onClick={() => setFilterStatus("all")}>
                Filter: {filterStatus.toUpperCase()} ×
              </span>
            )}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["PO ID", "Bahan", "Vendor", "Outlet", "Qty", "Total Biaya", "Status", "Dibuat Oleh", "Tanggal", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada PO.</td></tr>
              ) : (
                filtered.map((po) => (
                  <tr
                    key={po.id}
                    style={{ borderTop: "1px solid hsl(var(--border))", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setSelectedPO(po)}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--accent))", fontWeight: 700 }}>{po.id}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{po.namaBahan}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{po.namaVendor}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))" }}>
                        {po.namaOutlet}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px" }}>{po.qtyOrder} {po.satuanBeli}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700 }}>{fmt(po.totalHarga)}</td>
                    <td style={{ padding: "10px 12px" }}><StatusBadge status={po.status} /></td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))", fontFamily: "monospace" }}>{po.createdBy ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{fmtDate(po.createdAt)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                        {po.status === "draft" && (
                          <button style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(245,158,11,0.15)", color: "hsl(var(--amber))", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                            <Send style={{ width: 10, height: 10 }} /> Kirim
                          </button>
                        )}
                        {po.status === "sent" && (
                          <button style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(34,197,94,0.15)", color: "hsl(var(--green))", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px" }}>
                            <CheckCircle2 style={{ width: 10, height: 10 }} /> Terima
                          </button>
                        )}
                        <button style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: "1px solid hsl(var(--border2))", cursor: "pointer", background: "transparent", color: "hsl(var(--muted))", fontWeight: 600 }}>
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Detail Modal */}
      {selectedPO && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "520px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Detail PO</h2>
                <span style={{ fontFamily: "monospace", fontSize: "13px", color: "hsl(var(--accent))" }}>{selectedPO.id}</span>
              </div>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => setSelectedPO(null)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <Timeline status={selectedPO.status} />

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Bahan", value: selectedPO.namaBahan },
                { label: "Vendor", value: selectedPO.namaVendor },
                { label: "Outlet", value: selectedPO.namaOutlet },
                { label: "Qty Order", value: `${selectedPO.qtyOrder} ${selectedPO.satuanBeli}` },
                { label: "Harga Satuan", value: fmt(selectedPO.hargaSatuan) },
                { label: "Total Harga", value: fmt(selectedPO.totalHarga) },
                { label: "Dibuat Oleh", value: selectedPO.createdBy ?? "—" },
                { label: "Tanggal Kirim", value: fmtDate(selectedPO.tanggalKirim) },
                { label: "Tanggal Terima", value: fmtDate(selectedPO.tanggalTerima) },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid hsl(var(--border))" }}>
                  <span style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              {selectedPO.aiNotes && (
                <div style={{ padding: "10px 12px", background: "rgba(200,241,53,0.08)", borderRadius: "8px", border: "1px solid rgba(200,241,53,0.2)" }}>
                  <p style={{ fontSize: "10px", color: "hsl(var(--accent))", fontWeight: 700, marginBottom: "4px" }}>AI NOTES</p>
                  <p style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>{selectedPO.aiNotes}</p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "20px" }}>
              {selectedPO.status === "draft" && (
                <button style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(245,158,11,0.15)", color: "hsl(var(--amber))", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Send style={{ width: 14, height: 14 }} /> Kirim PO
                </button>
              )}
              {selectedPO.status === "sent" && (
                <button style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(34,197,94,0.15)", color: "hsl(var(--green))", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Konfirmasi Terima
                </button>
              )}
              <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", cursor: "pointer", background: "transparent", color: "hsl(var(--muted))", fontSize: "13px" }} onClick={() => setSelectedPO(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
