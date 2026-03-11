"use client";

import { useState } from "react";
import { Store, TrendingUp, AlertTriangle, DollarSign, ChevronRight } from "lucide-react";

interface Outlet {
  id: string;
  namaOutlet: string;
}

interface MenuItem {
  id: string;
  namaMenu: string;
  outletId: string;
  kategori: string | null;
  hargaJual: number;
  totalCogs: number;
}

interface Props {
  outlets: Outlet[];
  menuList: MenuItem[];
  totalMenuCount: number;
  totalBahanCount: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const card = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "18px",
} as const;

const tabStyle = (active: boolean) => ({
  padding: "8px 16px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: active ? 700 : 500,
  cursor: "pointer",
  border: "none",
  background: active ? "hsl(var(--accent))" : "transparent",
  color: active ? "#0A0A0F" : "hsl(var(--muted))",
  transition: "all 0.2s",
});

export function StoresClient({ outlets, menuList, totalMenuCount, totalBahanCount }: Props) {
  const [tab, setTab] = useState<"overview" | "menu">("overview");
  const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null);

  const statCards = [
    {
      label: "Total Outlet",
      value: outlets.length,
      icon: Store,
      color: "hsl(var(--blue))",
      bg: "rgba(96,165,250,0.1)",
      sub: "Cabang aktif",
    },
    {
      label: "Inventory Net Worth",
      value: "Rp 0",
      icon: DollarSign,
      color: "hsl(var(--green))",
      bg: "rgba(34,197,94,0.1)",
      sub: "Upload data untuk kalkulasi",
    },
    {
      label: "Avg Upload Compliance",
      value: "0%",
      icon: TrendingUp,
      color: "hsl(var(--amber))",
      bg: "rgba(245,158,11,0.1)",
      sub: "Belum ada upload",
    },
    {
      label: "Butuh Perhatian",
      value: 0,
      icon: AlertTriangle,
      color: "hsl(var(--red))",
      bg: "rgba(239,68,68,0.1)",
      sub: "Outlet bermasalah",
    },
  ];

  const filteredMenu = selectedOutlet
    ? menuList.filter((m) => m.outletId === selectedOutlet)
    : menuList;

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Stores</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>
          Manajemen outlet dan profitabilitas menu
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {statCards.map((sc) => (
          <div key={sc.label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  {sc.label}
                </p>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "hsl(var(--text))", lineHeight: 1 }}>
                  {sc.value}
                </p>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted))", marginTop: "4px" }}>{sc.sub}</p>
              </div>
              <div style={{ background: sc.bg, borderRadius: "10px", padding: "10px" }}>
                <sc.icon style={{ width: 20, height: 20, color: sc.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ ...card }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "12px" }}>
          <button style={tabStyle(tab === "overview")} onClick={() => setTab("overview")}>Overview Outlet</button>
          <button style={tabStyle(tab === "menu")} onClick={() => setTab("menu")}>Menu Profitability</button>
        </div>

        {tab === "overview" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["Outlet ID", "Nama Outlet", "Upload Compliance", "Net Worth", "Critical", "Warning", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {outlets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>
                    Belum ada outlet terdaftar.
                  </td>
                </tr>
              ) : (
                outlets.map((o) => (
                  <tr
                    key={o.id}
                    style={{ borderTop: "1px solid hsl(var(--border))" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--muted))" }}>{o.id}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{o.namaOutlet}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "hsl(var(--border2))", borderRadius: "3px" }}>
                          <div style={{ width: "0%", height: "100%", background: "hsl(var(--green))", borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>0%</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>Rp 0</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(239,68,68,0.15)", color: "hsl(var(--red))" }}>0</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(245,158,11,0.15)", color: "hsl(var(--amber))" }}>0</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <button
                        style={{
                          fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer",
                          background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))", fontWeight: 600,
                          display: "flex", alignItems: "center", gap: "4px",
                        }}
                        onClick={() => setSelectedOutlet(o.id)}
                      >
                        Detail <ChevronRight style={{ width: 12, height: 12 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === "menu" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              <button
                style={{
                  fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid hsl(var(--border2))", cursor: "pointer",
                  background: !selectedOutlet ? "hsl(var(--accent))" : "transparent",
                  color: !selectedOutlet ? "#0A0A0F" : "hsl(var(--muted))",
                }}
                onClick={() => setSelectedOutlet(null)}
              >
                Semua
              </button>
              {outlets.map((o) => (
                <button
                  key={o.id}
                  style={{
                    fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid hsl(var(--border2))", cursor: "pointer",
                    background: selectedOutlet === o.id ? "hsl(var(--accent))" : "transparent",
                    color: selectedOutlet === o.id ? "#0A0A0F" : "hsl(var(--muted))",
                  }}
                  onClick={() => setSelectedOutlet(selectedOutlet === o.id ? null : o.id)}
                >
                  {o.namaOutlet}
                </button>
              ))}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#14142A" }}>
                  {["Nama Menu", "COGS", "Harga Jual", "Margin", "Kontribusi"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMenu.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>
                      Belum ada menu terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredMenu.map((m) => {
                    const margin = m.hargaJual > 0 ? ((m.hargaJual - m.totalCogs) / m.hargaJual) * 100 : 0;
                    const marginColor = margin >= 65 ? "hsl(var(--green))" : "hsl(var(--amber))";
                    const marginBg = margin >= 65 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)";
                    return (
                      <tr
                        key={m.id}
                        style={{ borderTop: "1px solid hsl(var(--border))" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{m.namaMenu}</td>
                        <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{fmt(m.totalCogs)}</td>
                        <td style={{ padding: "10px 12px", fontSize: "12px" }}>{fmt(m.hargaJual)}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: marginBg, color: marginColor }}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>—</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
