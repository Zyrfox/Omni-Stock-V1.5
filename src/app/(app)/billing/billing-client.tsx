"use client";

import { useState } from "react";
import { FileText, CheckCircle2, Clock, DollarSign, X } from "lucide-react";

interface Invoice {
  id: string;
  status: string;
  totalHarga: number;
  qtyOrder: number;
  createdAt: string;
  namaVendor: string;
  namaBahan: string;
  outletId: string;
}

interface Props {
  totalPO: number;
  outstandingCount: number;
  outstandingTotal: number;
  lunasCount: number;
  lunasTotal: number;
  bulanIniTotal: number;
  invoices: Invoice[];
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

export function BillingClient({ totalPO, outstandingCount, outstandingTotal, lunasCount, lunasTotal, bulanIniTotal, invoices }: Props) {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(invoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const currentOutstanding = invoiceList.filter(i => i.status !== "received").length;
  const currentOutstandingTotal = invoiceList.filter(i => i.status !== "received").reduce((s, i) => s + i.totalHarga, 0);
  const currentLunas = invoiceList.filter(i => i.status === "received").length;
  const currentLunasTotal = invoiceList.filter(i => i.status === "received").reduce((s, i) => s + i.totalHarga, 0);

  // suppress unused prop warnings
  void totalPO; void outstandingCount; void outstandingTotal; void lunasCount; void lunasTotal; void bulanIniTotal;

  const statCards = [
    {
      label: "Total Invoice", value: invoiceList.length, icon: FileText,
      color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Semua PO",
    },
    {
      label: "Outstanding", value: currentOutstanding, icon: Clock,
      color: "hsl(var(--amber))", bg: "rgba(245,158,11,0.1)",
      sub: fmt(currentOutstandingTotal),
    },
    {
      label: "Lunas", value: currentLunas, icon: CheckCircle2,
      color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)",
      sub: fmt(currentLunasTotal),
    },
    {
      label: "Bulan Ini", value: fmt(bulanIniTotal), icon: DollarSign,
      color: "hsl(var(--accent))", bg: "rgba(200,241,53,0.1)", sub: "Total pengeluaran",
    },
  ];

  async function handleTandaiLunas(inv: Invoice) {
    setLoadingId(inv.id);
    setError("");
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inv.id, action: "receive" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui invoice");
      const updated = { ...inv, status: "received" };
      setInvoiceList(prev => prev.map(i => i.id === inv.id ? updated : i));
      if (selectedInvoice?.id === inv.id) setSelectedInvoice(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Billing & Invoicing</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>Kelola invoice dan status pembayaran PO</p>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "hsl(var(--red))", fontSize: "13px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{error}</span>
          <button onClick={() => setError("")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--red))" }}>×</button>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {statCards.map((sc) => (
          <div key={sc.label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{sc.label}</p>
                <p style={{ fontSize: typeof sc.value === "string" ? "18px" : "28px", fontWeight: 800, color: "hsl(var(--text))", lineHeight: 1 }}>{sc.value}</p>
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
          <span style={{ fontWeight: 700, fontSize: "13px" }}>Daftar Invoice</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["Invoice ID", "Tanggal", "Vendor", "Item", "Total Biaya", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoiceList.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada invoice.</td></tr>
              ) : (
                invoiceList.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ borderTop: "1px solid hsl(var(--border))", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--accent))", fontWeight: 700 }}>{inv.id}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{fmtDate(inv.createdAt)}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{inv.namaVendor}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px" }}>{inv.namaBahan}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700, color: "hsl(var(--red))" }}>{fmt(inv.totalHarga)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {inv.status === "received" ? (
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(34,197,94,0.15)", color: "hsl(var(--green))" }}>
                          ✓ LUNAS
                        </span>
                      ) : (
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(245,158,11,0.15)", color: "hsl(var(--amber))" }}>
                          UNPAID
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))", fontWeight: 600 }}
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          Detail
                        </button>
                        <button style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid hsl(var(--border2))", cursor: "pointer", background: "transparent", color: "hsl(var(--muted))", fontWeight: 600 }}>
                          PDF
                        </button>
                        {inv.status !== "received" && (
                          <button
                            disabled={loadingId === inv.id}
                            style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, opacity: loadingId === inv.id ? 0.6 : 1 }}
                            onClick={() => handleTandaiLunas(inv)}
                          >
                            {loadingId === inv.id ? "..." : "Tandai Lunas"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInvoice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Invoice {selectedInvoice.id}</h2>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => setSelectedInvoice(null)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Vendor", value: selectedInvoice.namaVendor },
                { label: "Item", value: selectedInvoice.namaBahan },
                { label: "Qty Order", value: String(selectedInvoice.qtyOrder) },
                { label: "Total Harga", value: fmt(selectedInvoice.totalHarga) },
                { label: "Tanggal", value: fmtDate(selectedInvoice.createdAt) },
                { label: "Status", value: selectedInvoice.status === "received" ? "LUNAS" : "UNPAID" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid hsl(var(--border))" }}>
                  <span style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>{row.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              {selectedInvoice.status !== "received" && (
                <button
                  disabled={loadingId === selectedInvoice.id}
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, cursor: "pointer", fontSize: "13px", opacity: loadingId === selectedInvoice.id ? 0.6 : 1 }}
                  onClick={() => handleTandaiLunas(selectedInvoice)}
                >
                  {loadingId === selectedInvoice.id ? "Memproses..." : "Tandai Lunas"}
                </button>
              )}
              <button style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }} onClick={() => setSelectedInvoice(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
