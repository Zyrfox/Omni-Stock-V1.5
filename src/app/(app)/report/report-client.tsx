"use client";

import { useState } from "react";
import { TrendingDown, CheckCircle2, Clock, AlertTriangle, Download } from "lucide-react";

interface Props {
  monthlyData: number[];
  currentYear: number;
  currentMonth: number;
  totalPengeluaran: number;
  totalPOSelesai: number;
  avgLeadTime: number;
  topBahan: { namaBahan: string; total: number }[];
  vendorPerf: { namaVendor: string; estimasiPengiriman: number; poCount: number }[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const card = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "18px",
} as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ReportClient({ monthlyData, currentYear, currentMonth, totalPengeluaran, totalPOSelesai, avgLeadTime, topBahan, vendorPerf }: Props) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const maxVal = Math.max(...monthlyData, 1);

  const statCards = [
    { label: "Total Pengeluaran", value: fmt(totalPengeluaran), icon: TrendingDown, color: "hsl(var(--red))", bg: "rgba(239,68,68,0.1)", sub: "PO received" },
    { label: "PO Selesai", value: totalPOSelesai, icon: CheckCircle2, color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)", sub: "Bulan ini" },
    { label: "Avg Lead Time", value: `${avgLeadTime} hari`, icon: Clock, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Estimasi vendor" },
    { label: "Item Critical", value: "—", icon: AlertTriangle, color: "hsl(var(--red))", bg: "rgba(239,68,68,0.1)", sub: "Butuh upload data" },
  ];

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Report & Analytics</h1>
          <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>Analisis pengeluaran dan performa vendor</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "hsl(var(--surface))", borderRadius: "8px", padding: "3px", border: "1px solid hsl(var(--border))" }}>
            {(["week", "month", "year"] as const).map((p) => (
              <button
                key={p}
                style={{
                  padding: "5px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", border: "none",
                  background: period === p ? "hsl(var(--card))" : "transparent",
                  color: period === p ? "hsl(var(--text))" : "hsl(var(--muted))",
                  fontWeight: period === p ? 700 : 500,
                }}
                onClick={() => setPeriod(p)}
              >
                {p === "week" ? "Minggu Ini" : p === "month" ? "Bulan Ini" : "Tahun Ini"}
              </button>
            ))}
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "12px" }}>
            <Download style={{ width: 14, height: 14 }} /> Export Excel
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {statCards.map((sc) => (
          <div key={sc.label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{sc.label}</p>
                <p style={{ fontSize: typeof sc.value === "string" && sc.value.length > 8 ? "16px" : "24px", fontWeight: 800, color: "hsl(var(--text))", lineHeight: 1 }}>{sc.value}</p>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted))", marginTop: "4px" }}>{sc.sub}</p>
              </div>
              <div style={{ background: sc.bg, borderRadius: "10px", padding: "10px" }}>
                <sc.icon style={{ width: 20, height: 20, color: sc.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ fontWeight: 700, fontSize: "13px" }}>Tren Pengeluaran {currentYear}</span>
          <span style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>Data dari PO received</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px" }}>
          {monthlyData.map((val, i) => {
            const barH = maxVal > 0 ? (val / maxVal) * 140 : 0;
            const isCurrentMonth = i === currentMonth;
            return (
              <div
                key={i}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer" }}
                title={`${MONTHS[i]}: ${fmt(val)}`}
              >
                <div style={{
                  width: "100%", height: `${Math.max(barH, 3)}px`,
                  background: isCurrentMonth
                    ? "linear-gradient(180deg, hsl(var(--accent)), hsl(var(--accentD)))"
                    : "hsl(var(--border2))",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.3s ease",
                  position: "relative",
                }}>
                  {isCurrentMonth && val > 0 && (
                    <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "9px", color: "hsl(var(--accent))", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {fmt(val)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "10px", color: isCurrentMonth ? "hsl(var(--accent))" : "hsl(var(--muted))", fontWeight: isCurrentMonth ? 700 : 500 }}>
                  {MONTHS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Top 5 Bahan */}
        <div style={card}>
          <span style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "16px" }}>Top 5 Bahan by Pengeluaran</span>
          {topBahan.length === 0 ? (
            <p style={{ fontSize: "12px", color: "hsl(var(--muted))", textAlign: "center", padding: "20px 0" }}>Belum ada data.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topBahan.map((b, i) => {
                const maxBahan = topBahan[0].total;
                const pct = maxBahan > 0 ? (b.total / maxBahan) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{b.namaBahan}</span>
                      <span style={{ fontSize: "12px", color: "hsl(var(--accent))", fontWeight: 700 }}>{fmt(b.total)}</span>
                    </div>
                    <div style={{ height: "6px", background: "hsl(var(--border2))", borderRadius: "3px" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accentD)))", borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vendor Performance */}
        <div style={card}>
          <span style={{ fontWeight: 700, fontSize: "13px", display: "block", marginBottom: "16px" }}>Performa Vendor</span>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["Vendor", "Est. Lead", "Total PO", "Penilaian"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorPerf.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "12px" }}>Belum ada data vendor.</td></tr>
              ) : (
                vendorPerf.map((v, i) => {
                  const badge = v.estimasiPengiriman <= 2
                    ? { label: "CEPAT", color: "hsl(var(--green))", bg: "rgba(34,197,94,0.15)" }
                    : v.estimasiPengiriman <= 5
                      ? { label: "NORMAL", color: "hsl(var(--amber))", bg: "rgba(245,158,11,0.15)" }
                      : { label: "LAMBAT", color: "hsl(var(--red))", bg: "rgba(239,68,68,0.15)" };
                  return (
                    <tr key={i} style={{ borderTop: "1px solid hsl(var(--border))" }}>
                      <td style={{ padding: "8px 10px", fontSize: "12px", fontWeight: 600 }}>{v.namaVendor}</td>
                      <td style={{ padding: "8px 10px", fontSize: "12px", color: "hsl(var(--muted))" }}>{v.estimasiPengiriman}h</td>
                      <td style={{ padding: "8px 10px", fontSize: "12px" }}>{v.poCount}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
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
