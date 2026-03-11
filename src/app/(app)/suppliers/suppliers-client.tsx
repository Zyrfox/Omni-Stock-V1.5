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

export function SuppliersClient({ vendors: initialVendors, vendorCount, distinctBahanCount, waCount, statsMap, spendMap, poHistory }: Props) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addForm, setAddForm] = useState({
    namaVendor: "",
    kontakWa: "",
    estimasiPengiriman: "",
    noRekening: "",
  });

  const [editForm, setEditForm] = useState({
    namaVendor: "",
    kontakWa: "",
    estimasiPengiriman: "",
    noRekening: "",
  });

  const statCards = [
    { label: "Total Vendor", value: vendors.length, icon: Truck, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Supplier aktif" },
    { label: "Total Bahan", value: distinctBahanCount, icon: Plus, color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)", sub: "Distinct bahan baku" },
    { label: "Vendor dengan WA", value: vendors.filter((v) => v.kontakWa).length, icon: MessageCircle, color: "hsl(var(--accent))", bg: "rgba(200,241,53,0.1)", sub: "Bisa dihubungi WA" },
  ];

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaVendor: addForm.namaVendor,
          kontakWa: addForm.kontakWa || undefined,
          estimasiPengiriman: Number(addForm.estimasiPengiriman),
          noRekening: addForm.noRekening || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menambahkan vendor");
        return;
      }
      setVendors((prev) => [...prev, data.data]);
      setShowAddModal(false);
      setAddForm({ namaVendor: "", kontakWa: "", estimasiPengiriman: "", noRekening: "" });
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: showEditModal.id,
          namaVendor: editForm.namaVendor,
          kontakWa: editForm.kontakWa || null,
          estimasiPengiriman: Number(editForm.estimasiPengiriman),
          noRekening: editForm.noRekening || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengupdate vendor");
        return;
      }
      setVendors((prev) => prev.map((v) => v.id === showEditModal.id ? data.data : v));
      if (selectedVendor?.id === showEditModal.id) setSelectedVendor(data.data);
      setShowEditModal(null);
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (v: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({
      namaVendor: v.namaVendor,
      kontakWa: v.kontakWa || "",
      estimasiPengiriman: String(v.estimasiPengiriman),
      noRekening: v.noRekening || "",
    });
    setShowEditModal(v);
    setError(null);
  };

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
            <p style={{ fontSize: "12px", color: "hsl(var(--muted))", fontFamily: "monospace" }}>{selectedVendor.id}</p>
          </div>
          <button
            style={{ marginLeft: "auto", background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: "8px", padding: "6px 12px", color: "hsl(var(--blue))", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
            onClick={(e) => openEdit(selectedVendor, e)}
          >
            <Edit2 style={{ width: 12, height: 12, display: "inline", marginRight: "4px" }} />
            Edit Vendor
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "📞 Kontak WA", value: selectedVendor.kontakWa ?? "—" },
            { label: "💳 Info Pembayaran", value: selectedVendor.noRekening ?? "—" },
            { label: "⏱ Lead Time", value: `${selectedVendor.estimasiPengiriman} hari` },
            { label: "📈 Total Pengeluaran", value: fmt(totalSpend) },
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
            <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", marginBottom: "6px" }}>Pengeluaran Bulan Ini</p>
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
            onClick={() => { setShowAddModal(true); setError(null); }}
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
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock style={{ width: 10, height: 10 }} /> {v.estimasiPengiriman} hari
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "12px" }}>{statsMap[v.id] ?? 0}</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700, color: "hsl(var(--accent))" }}>
                    {fmt(spendMap[v.id] ?? 0)}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))" }}
                        onClick={(e) => openEdit(v, e)}
                      >
                        <Edit2 style={{ width: 12, height: 12 }} />
                      </button>
                      <button
                        style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(96,165,250,0.1)", color: "hsl(var(--blue))", fontWeight: 600 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedVendor(v); }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "480px" }}>
            <div style={{ height: "3px", background: "linear-gradient(90deg, #C8F135, #86EF3C, transparent)", borderRadius: "12px 12px 0 0", margin: "-18px -18px 18px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Tambah Vendor</h2>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => { setShowAddModal(false); setError(null); }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            {error && (
              <div style={{ padding: "8px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "12px", fontSize: "12px", color: "hsl(var(--red))" }}>
                ⚠ {error}
              </div>
            )}
            <form style={{ display: "flex", flexDirection: "column", gap: "14px" }} onSubmit={handleAddVendor}>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Nama Vendor *</label>
                <input type="text" required style={inputStyle} placeholder="Nama supplier" value={addForm.namaVendor} onChange={(e) => setAddForm((p) => ({ ...p, namaVendor: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>WhatsApp</label>
                <input type="text" style={inputStyle} placeholder="628xx..." value={addForm.kontakWa} onChange={(e) => setAddForm((p) => ({ ...p, kontakWa: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Lead Time (hari) *</label>
                <input type="number" required min="1" style={inputStyle} placeholder="1" value={addForm.estimasiPengiriman} onChange={(e) => setAddForm((p) => ({ ...p, estimasiPengiriman: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Info Rekening</label>
                <input type="text" style={inputStyle} placeholder="BCA 1234567890 a/n ..." value={addForm.noRekening} onChange={(e) => setAddForm((p) => ({ ...p, noRekening: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button type="button" style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }} onClick={() => { setShowAddModal(false); setError(null); }} disabled={loading}>Batal</button>
                <button type="submit" disabled={loading} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: loading ? "rgba(107,114,128,0.3)" : "linear-gradient(135deg, #C8F135, #86EF3C)", color: loading ? "hsl(var(--muted))" : "#0A0A0F", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontSize: "13px" }}>
                  {loading ? "Menyimpan..." : "Simpan Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "480px" }}>
            <div style={{ height: "3px", background: "linear-gradient(90deg, #C8F135, #86EF3C, transparent)", borderRadius: "12px 12px 0 0", margin: "-18px -18px 18px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Edit Vendor</h2>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => { setShowEditModal(null); setError(null); }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            {error && (
              <div style={{ padding: "8px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "12px", fontSize: "12px", color: "hsl(var(--red))" }}>
                ⚠ {error}
              </div>
            )}
            <form style={{ display: "flex", flexDirection: "column", gap: "14px" }} onSubmit={handleEditVendor}>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Nama Vendor *</label>
                <input type="text" required style={inputStyle} value={editForm.namaVendor} onChange={(e) => setEditForm((p) => ({ ...p, namaVendor: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>WhatsApp</label>
                <input type="text" style={inputStyle} placeholder="628xx..." value={editForm.kontakWa} onChange={(e) => setEditForm((p) => ({ ...p, kontakWa: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Lead Time (hari) *</label>
                <input type="number" required min="1" style={inputStyle} value={editForm.estimasiPengiriman} onChange={(e) => setEditForm((p) => ({ ...p, estimasiPengiriman: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Info Rekening</label>
                <input type="text" style={inputStyle} value={editForm.noRekening} onChange={(e) => setEditForm((p) => ({ ...p, noRekening: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button type="button" style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }} onClick={() => { setShowEditModal(null); setError(null); }} disabled={loading}>Batal</button>
                <button type="submit" disabled={loading} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: loading ? "rgba(107,114,128,0.3)" : "linear-gradient(135deg, #C8F135, #86EF3C)", color: loading ? "hsl(var(--muted))" : "#0A0A0F", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontSize: "13px" }}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
