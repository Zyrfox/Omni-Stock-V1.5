"use client";

import { useState } from "react";
import { Package, Layers, ArrowLeftRight } from "lucide-react";

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

export default function CategoryPage() {
  const [tab, setTab] = useState<"habis" | "aset" | "mutasi">("habis");

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Assets & Inventory</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>
          Barang habis pakai, aset tetap, dan mutasi antar cabang
        </p>
      </div>

      <div style={card}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "12px" }}>
          <button style={tabStyle(tab === "habis")} onClick={() => setTab("habis")}>Barang Habis Pakai</button>
          <button style={tabStyle(tab === "aset")} onClick={() => setTab("aset")}>Aset Tetap</button>
          <button style={tabStyle(tab === "mutasi")} onClick={() => setTab("mutasi")}>Mutasi Antar Cabang</button>
        </div>

        {tab === "habis" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package style={{ width: 16, height: 16, color: "hsl(var(--blue))" }} />
                <span style={{ fontWeight: 700, fontSize: "13px" }}>Barang Habis Pakai</span>
              </div>
            </div>
            {/* Empty state — no consumables table in schema yet */}
            <div style={{ textAlign: "center", padding: "60px 20px", color: "hsl(var(--muted))" }}>
              <Package style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>Belum Ada Data</p>
              <p style={{ fontSize: "13px", maxWidth: "400px", margin: "0 auto" }}>
                Modul barang habis pakai (consumables) belum tersedia di skema database saat ini.
                Data ini akan ditambahkan di versi berikutnya.
              </p>
              <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(96,165,250,0.08)", borderRadius: "8px", border: "1px solid rgba(96,165,250,0.2)", display: "inline-block" }}>
                <p style={{ fontSize: "12px", color: "hsl(var(--blue))" }}>
                  Tabel: <code>consumables</code> — Dijadwalkan di V1.6
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "aset" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Layers style={{ width: 16, height: 16, color: "hsl(var(--green))" }} />
              <span style={{ fontWeight: 700, fontSize: "13px" }}>Aset Tetap</span>
            </div>
            <div style={{ textAlign: "center", padding: "60px 20px", color: "hsl(var(--muted))" }}>
              <Layers style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>Belum Ada Data</p>
              <p style={{ fontSize: "13px", maxWidth: "400px", margin: "0 auto" }}>
                Modul aset tetap belum tersedia di skema database saat ini.
                Data ini akan ditambahkan di versi berikutnya.
              </p>
              <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(34,197,94,0.08)", borderRadius: "8px", border: "1px solid rgba(34,197,94,0.2)", display: "inline-block" }}>
                <p style={{ fontSize: "12px", color: "hsl(var(--green))" }}>
                  Tabel: <code>fixed_assets</code> — Dijadwalkan di V1.6
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "mutasi" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <ArrowLeftRight style={{ width: 16, height: 16, color: "hsl(var(--amber))" }} />
              <span style={{ fontWeight: 700, fontSize: "13px" }}>Mutasi Antar Cabang</span>
            </div>
            <div style={{ textAlign: "center", padding: "60px 20px", color: "hsl(var(--muted))" }}>
              <ArrowLeftRight style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>Belum Ada Data</p>
              <p style={{ fontSize: "13px", maxWidth: "400px", margin: "0 auto" }}>
                Fitur mutasi stok antar cabang belum tersedia. Fitur ini memungkinkan transfer
                inventori dari satu outlet ke outlet lain.
              </p>
              <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(245,158,11,0.08)", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.2)", display: "inline-block" }}>
                <p style={{ fontSize: "12px", color: "hsl(var(--amber))" }}>
                  Tabel: <code>stock_mutations</code> — Dijadwalkan di V1.6
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
