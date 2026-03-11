"use client";

import { useState } from "react";
import { Truck, MessageCircle, Edit2, ChevronLeft, Plus, X, Clock } from "lucide-react";

interface Vendor {
  id: string;
  namaVendor: string;
  noRekening: string | null;
  kontakWa: string | null;
  estimasiPengiriman: number;
}

interface POItem {
  id: string;
  vendorId: string;
  status: string;
  totalHarga: number;
  createdAt: string;
}

interface Props {
  vendors: Vendor[];
  vendorCount: number;
  distinctBahanCount: number;
  waCount: number;
  statsMap: Record<string, number>;
  spendMap: Record<string, number>;
  poHistory: POItem[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

const card = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "18px",
} as const;

const inputStyle = {
  width: "100%",
  background: "hsl(var(--surface))",
  border: "1px solid hsl(var(--border2))",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "hsl(var(--text))",
  fontSize: "13px",
  boxSizing: "border-box" as const,
};

export function SuppliersClient({ vendors, vendorCount, distinctBahanCount, waCount, statsMap, spendMap, poHistory }: Props) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const statCards = [
    { label: "Total Vendor", value: vendorCount, icon: Truck, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Supplier aktif" },
    { label: "Total Bahan", value: distinctBahanCount, icon: Plus, color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)", sub: "Distinct bahan baku" },
    { label: "Vendor dengan WA", value: waCount, icon: MessageCircle, color: "hsl(var(--accent))", bg: "rgba(200,241,53,0.1)", sub: "Bisa dihubungi WA" },
  ];

  if (selectedVendor) {
    const vendorPOs = poHistory.filter((p) => p.vendorId === selectedVendor.id);
    const totalSpend = spendMap[selectedVendor.id] ?? 0;
    const itemCount = statsMap[selectedVendor.id] ?? 0;

    return (
      <div style={{ color: "hsl(var(--text))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button
            style={{ background: "transparent", border: "1px solid hsl(var(--border2))", borderRadius: "8px", padding: "6px 12px", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setSelectedVendor(null)}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} /> Kembali
          </button>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700 }}>{selectedVendor.namaVendor}</h1>
            <p style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>{selectedVendor.id}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "Nama Vendor", value: selectedVendor.namaVendor },
            { label: "WhatsApp", value: selectedVendor.kontakWa ?? "—" },
            { label: "No. Rekening", value: selectedVendor.noRekening ?? "—" },
            { label: "Est. Pengiriman", value: `${selectedVendor.estimasiPengiriman} hari` },
          ].map((info) => (
            <div key={info.label} style={card}>
              <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", marginBottom: "6px" }}>{info.label}</p>
              <p style={{ fontSize: "14px", fontWeight: 700 }}>{info.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
          <div style={card}>
            <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", marginBottom: "6px" }}>Total Item Disuplai</p>
            <p style={{ fontSize: "28px", fontWeight: 800, color: "hsl(var(--blue))" }}>{itemCount}</p>
          </div>
          <div style={card}>
            <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", marginBottom: "6px" }}>Total Pengeluaran</p>
            <p style={{ fontSize: "24px", fontWeight: 800, color: "hsl(var(--accent))" }}>{fmt(totalSpend)}</p>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ fontWeight: 700, fontSize: "14px", marginBottom: "14px" }}>Riwayat PO</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["PO ID", "Status", "Total", "Tanggal"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorPOs.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada PO untuk vendor ini.</td></tr>
              ) : (
                vendorPOs.map((po) => (
                  <tr key={po.id} style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--accent))" }}>{po.id}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                        background: po.status === "received" ? "rgba(34,197,94,0.15)" : po.status === "sent" ? "rgba(245,158,11,0.15)" : "rgba(107,114,128,0.15)",
                        color: po.status === "received" ? "hsl(var(--green))" : po.status === "sent" ? "hsl(var(--amber))" : "hsl(var(--muted))",
                      }}>
                        {po.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", fontWeight: 700 }}>{fmt(po.totalHarga)}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{fmtDate(po.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Suppliers</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>Manajemen vendor dan kontak supplier</p>
      </div>

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span style={{ fontWeight: 700, fontSize: "13px" }}>Daftar Vendor</span>
          <button
            style={{ background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, borderRadius: "8px", padding: "8px 16px", border: "none", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus style={{ width: 14, height: 14 }} /> Tambah Vendor
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#14142A" }}>
              {["Nama Vendor", "WhatsApp", "Info Pembayaran", "Lead Time", "Item", "Pengeluaran", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>
                  Belum ada vendor. Tambahkan vendor pertama Anda.
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr
                  key={v.id}
                  style={{ borderTop: "1px solid hsl(var(--border))", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => setSelectedVendor(v)}
                >
                  <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{v.namaVendor}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {v.kontakWa ? (
                      <span style={{ fontSize: "12px", color: "hsl(var(--green))", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MessageCircle style={{ width: 12, height: 12 }} /> {v.kontakWa}
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "11px", color: "hsl(var(--muted))", fontFamily: "monospace" }}>
                    {v.noRekening ?? "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))", display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                      <Clock style={{ width: 10, height: 10 }} /> {v.estimasiPengiriman} hari
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "12px" }}>{statsMap[v.id] ?? 0}</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700, color: "hsl(var(--accent))" }}>
                    {fmt(spendMap[v.id] ?? 0)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                      <button style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))" }}>
                        <Edit2 style={{ width: 12, height: 12 }} />
                      </button>
                      <button
                        style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(96,165,250,0.1)", color: "hsl(var(--blue))", fontWeight: 600 }}
                        onClick={() => setSelectedVendor(v)}
                      >
                        Detail →
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Tambah Vendor</h2>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => setShowAddModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form style={{ display: "flex", flexDirection: "column", gap: "14px" }} onSubmit={(e) => { e.preventDefault(); alert("Connect to server action"); }}>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Nama Vendor *</label>
                <input type="text" required style={inputStyle} placeholder="Nama supplier" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>WhatsApp</label>
                <input type="text" style={inputStyle} placeholder="628xx..." />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Lead Time (hari) *</label>
                <input type="number" required style={inputStyle} placeholder="1" min="1" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Info Rekening</label>
                <input type="text" style={inputStyle} placeholder="BCA 1234567890 a/n ..." />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button type="button" style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }} onClick={() => setShowAddModal(false)}>Batal</button>
                <button type="submit" style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, cursor: "pointer", fontSize: "13px" }}>Simpan Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
