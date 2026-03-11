"use client";

import { useState, useCallback } from "react";
import {
  Package, ShoppingCart, Store, AlertTriangle, Upload, TrendingUp,
  Brain, FileText, AlertCircle, XCircle
} from "lucide-react";

interface Stats {
  totalBahan: number;
  totalOutlets: number;
  totalUsers: number;
  poDraft: number;
  poSent: number;
  poReceived: number;
  poTotal: number;
  pengeluaran: number;
}

interface PO {
  id: string;
  status: string;
  qtyOrder: number;
  totalHarga: number;
  createdAt: string;
  namaVendor: string;
  namaBahan: string;
  satuanBeli: string;
}

interface Bahan {
  id: string;
  namaBahan: string;
  tipeBahan: string;
  kategoriBahan: string;
  stokMinimum: number;
  hargaBeli: number;
  satuanBeli: string;
  hargaPerSatuanPorsi: number;
  avgDailyConsumption: number;
  leadTimeDays: number;
  outletId: string;
}

interface Props {
  stats: Stats;
  recentPOs: PO[];
  bahanList: Bahan[];
}

interface TransientStock {
  id: string; // matches bahanList.id
  stokAkhir: number;
}

interface CartItem {
  bahanId: string;
  namaBahan: string;
  vendorName: string;
  qty: number;
  tipe: string;
  aiResearch?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

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

export function DashboardClient({ stats, recentPOs, bahanList }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [transientStocks, setTransientStocks] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xls") || f.name.endsWith(".xlsx") || f.name.endsWith(".csv"))) {
      setUploadFile(f);
      setUploadMsg(`Ready: ${f.name}`);
    } else {
      setUploadMsg("Please drop an .xls, .xlsx, or .csv file.");
    }
  }, []);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [creatingPO, setCreatingPO] = useState(false);

  const processUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("outlet_id", "OUT-001");

      const res = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload gagal");

      // Update transient stocks from API response
      if (data.data && Array.isArray(data.data)) {
        const newStocks: Record<string, number> = {};
        for (const item of data.data) {
          newStocks[item.id] = item.stokAkhir;
        }
        setTransientStocks(newStocks);
      }

      setUploadResult(data.message);
      setUploadFile(null);
      setUploadMsg("");
    } catch (e: any) {
      setUploadResult(`Error: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const calculateStatus = (b: Bahan) => {
    if (!(b.id in transientStocks)) return "NO DATA";
    const stokAkhir = transientStocks[b.id];
    const safeThreshold = b.stokMinimum + (b.leadTimeDays * b.avgDailyConsumption);
    if (stokAkhir <= b.stokMinimum) return "CRITICAL";
    if (stokAkhir <= safeThreshold) return "WARNING";
    return "SAFE";
  };

  const addToCart = (b: Bahan) => {
    setCart(prev => {
      if (prev.find(x => x.bahanId === b.id)) return prev;
      return [...prev, {
        bahanId: b.id,
        namaBahan: b.namaBahan,
        vendorName: "Hubungkan Vendor", // To be fetched automatically
        qty: b.stokMinimum * 2,
        tipe: b.tipeBahan
      }];
    });
  };

  // Compute stock stats from transient data
  const hasUploadData = Object.keys(transientStocks).length > 0;
  const safeCount = hasUploadData ? bahanList.filter(b => calculateStatus(b) === "SAFE").length : 0;
  const warningCount = hasUploadData ? bahanList.filter(b => calculateStatus(b) === "WARNING").length : 0;
  const criticalCount = hasUploadData ? bahanList.filter(b => calculateStatus(b) === "CRITICAL").length : 0;

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalBahan,
      icon: Package,
      color: "hsl(var(--blue))",
      bg: "rgba(96,165,250,0.1)",
      sub: "Master bahan baku",
    },
    {
      label: "Available Stock",
      value: hasUploadData ? safeCount : "—",
      icon: Store,
      color: "hsl(var(--green))",
      bg: "rgba(34,197,94,0.1)",
      sub: hasUploadData ? `${safeCount} item aman` : "Upload Pawoon data",
    },
    {
      label: "Warning + Critical",
      value: hasUploadData ? warningCount + criticalCount : "—",
      icon: AlertTriangle,
      color: "hsl(var(--amber))",
      bg: "rgba(245,158,11,0.1)",
      sub: hasUploadData ? `${warningCount} warning, ${criticalCount} critical` : "No upload session",
    },
    {
      label: "Out of Stock",
      value: hasUploadData ? criticalCount : "—",
      icon: XCircle,
      color: "hsl(var(--red))",
      bg: "rgba(239,68,68,0.1)",
      sub: hasUploadData ? `${criticalCount} perlu restock` : "No upload session",
    },
  ];

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "hsl(var(--text))" }}>Dashboard</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>
          Selamat datang di OmniStock V1.5 — Intelligent Inventory Management
        </p>
      </div>

      {/* Smart Batch Uploader */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <Upload style={{ color: "hsl(var(--accent))", width: 18, height: 18 }} />
          <span style={{ fontWeight: 700, fontSize: "14px" }}>Smart Batch Uploader</span>
          <span style={{ fontSize: "10px", color: "hsl(var(--muted))", background: "rgba(107,114,128,0.15)", padding: "2px 6px", borderRadius: "4px" }}>
            Pawoon Export
          </span>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? "hsl(var(--accent))" : "hsl(var(--border2))"}`,
            borderRadius: "10px",
            padding: "28px",
            textAlign: "center",
            background: dragging ? "rgba(200,241,53,0.05)" : "transparent",
            transition: "all 0.2s",
            cursor: "pointer",
          }}
        >
          <Upload style={{ width: 32, height: 32, color: "hsl(var(--muted))", margin: "0 auto 10px" }} />
          <p style={{ fontSize: "14px", color: "hsl(var(--muted))" }}>
            {uploadFile ? uploadMsg : "Drag & drop file Pawoon (.xls / .xlsx) di sini"}
          </p>
          {!uploadFile && (
            <p style={{ fontSize: "12px", color: "hsl(var(--muted))", marginTop: "4px" }}>
              atau{" "}
              <label style={{ color: "hsl(var(--accent))", cursor: "pointer" }}>
                browse file
                <input
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setUploadFile(f); setUploadMsg(`Ready: ${f.name}`); }
                  }}
                />
              </label>
            </p>
          )}
          {uploadFile && (
            <button
              disabled={uploading}
              style={{
                marginTop: "12px",
                background: uploading ? "rgba(200,241,53,0.3)" : "linear-gradient(135deg, #C8F135, #86EF3C)",
                color: uploading ? "hsl(var(--accent))" : "#0A0A0F",
                fontWeight: 800,
                borderRadius: "8px",
                padding: "8px 20px",
                border: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "12px auto 0",
              }}
              onClick={processUpload}
            >
              {uploading ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                "⚡ Process Upload"
              )}
            </button>
          )}
        </div>
        <p style={{ fontSize: "11px", color: "hsl(var(--muted))", marginTop: "8px" }}>
          Data stok bersifat transient — stok aktual hanya tersedia setelah upload Pawoon berhasil diproses.
        </p>
        {uploadResult && (
          <div style={{
            marginTop: "10px", padding: "10px 14px", borderRadius: "8px",
            background: uploadResult.startsWith("Error") ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${uploadResult.startsWith("Error") ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
            fontSize: "12px",
            color: uploadResult.startsWith("Error") ? "hsl(var(--red))" : "hsl(var(--green))",
            fontWeight: 600,
          }}>
            {uploadResult.startsWith("Error") ? "⚠ " : "✓ "}{uploadResult}
          </div>
        )}
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

      {/* Widget Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
        {/* Top Contributors */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <TrendingUp style={{ width: 16, height: 16, color: "hsl(var(--green))" }} />
            <span style={{ fontWeight: 700, fontSize: "13px" }}>Top Contributors</span>
          </div>
          {recentPOs.length === 0 ? (
            <p style={{ fontSize: "12px", color: "hsl(var(--muted))", textAlign: "center", padding: "20px 0" }}>
              Belum ada PO tercatat
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentPOs.slice(0, 5).map((po) => (
                <div key={po.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "hsl(var(--text))" }}>{po.namaBahan}</span>
                  <span style={{ fontSize: "12px", color: "hsl(var(--accent))", fontWeight: 700 }}>
                    {fmt(po.totalHarga)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Pengeluaran */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <FileText style={{ width: 16, height: 16, color: "hsl(var(--blue))" }} />
            <span style={{ fontWeight: 700, fontSize: "13px" }}>Audit Pengeluaran</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "Total PO", value: stats.poTotal, color: "hsl(var(--blue))" },
              { label: "Draft", value: stats.poDraft, color: "hsl(var(--muted))" },
              { label: "Sent", value: stats.poSent, color: "hsl(var(--amber))" },
              { label: "Received", value: stats.poReceived, color: "hsl(var(--green))" },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "10px", color: "hsl(var(--muted))", textTransform: "uppercase" }}>{item.label}</p>
                <p style={{ fontSize: "22px", fontWeight: 800, color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid hsl(var(--border))" }}>
            <p style={{ fontSize: "10px", color: "hsl(var(--muted))" }}>Total Pengeluaran (PO Received)</p>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "hsl(var(--accent))" }}>{fmt(stats.pengeluaran)}</p>
          </div>
        </div>

        {/* Smart Stock Warning */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <AlertTriangle style={{ width: 16, height: 16, color: "hsl(var(--amber))" }} />
            <span style={{ fontWeight: 700, fontSize: "13px" }}>Smart Stock Warning</span>
          </div>
          <div style={{ textAlign: "center", padding: "20px 0", color: "hsl(var(--muted))" }}>
            <AlertCircle style={{ width: 32, height: 32, margin: "0 auto 8px", opacity: 0.4 }} />
            <p style={{ fontSize: "12px" }}>Upload data Pawoon untuk melihat status stok</p>
            <p style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
              {bahanList.length} bahan terdaftar · Min stok dikonfigurasi
            </p>
          </div>
        </div>

        {/* AI Predictive Restock */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Brain style={{ width: 16, height: 16, color: "hsl(var(--accent))" }} />
            <span style={{ fontWeight: 700, fontSize: "13px" }}>AI Predictive Restock</span>
            <span style={{ fontSize: "9px", background: "rgba(200,241,53,0.15)", color: "hsl(var(--accent))", padding: "1px 5px", borderRadius: "3px", fontWeight: 700 }}>
              GEMINI
            </span>
          </div>
          <div style={{ textAlign: "center", padding: "20px 0", color: "hsl(var(--muted))" }}>
            <Brain style={{ width: 32, height: 32, margin: "0 auto 8px", opacity: 0.4 }} />
            <p style={{ fontSize: "12px" }}>AI membutuhkan data historis untuk prediksi</p>
            <p style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
              Upload minimal 7 hari data Pawoon
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

        {/* Main Content Area: Table & Logs */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Inventory Table */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Package style={{ width: 16, height: 16, color: "hsl(var(--blue))" }} />
                <span style={{ fontWeight: 700, fontSize: "13px" }}>Inventory Overview</span>
                <span style={{
                  fontSize: "10px", background: "rgba(107,114,128,0.15)", color: "hsl(var(--muted))",
                  padding: "2px 7px", borderRadius: "4px",
                }}>
                  {bahanList.length} items
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>
                Status dihitung otomatis 🔴🟠🟢
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#14142A" }}>
                    {["ID", "Nama Bahan", "Tipe", "Satuan", "Min", "Stok Aktual", "Status", "Aksi"].map((h) => (
                      <th key={h} style={{
                        padding: "10px 12px", textAlign: "left", fontSize: "10px",
                        textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bahanList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>
                        Belum ada data bahan. Tambahkan bahan di halaman Products.
                      </td>
                    </tr>
                  ) : (
                    bahanList.map((b) => {
                      const status = calculateStatus(b);
                      const inCart = cart.some(c => c.bahanId === b.id);

                      return (
                        <tr
                          key={b.id}
                          style={{ borderTop: "1px solid hsl(var(--border))", transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--muted))" }}>
                            {b.id}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{b.namaBahan}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                              background: b.tipeBahan === "packaged" ? "rgba(96,165,250,0.15)" : "rgba(34,197,94,0.15)",
                              color: b.tipeBahan === "packaged" ? "hsl(var(--blue))" : "hsl(var(--green))",
                            }}>
                              {b.tipeBahan === "packaged" ? "PACKAGED" : "RAW BULK"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{b.satuanBeli}</td>
                          <td style={{ padding: "10px 12px", fontSize: "12px" }}>{b.stokMinimum}</td>
                          <td style={{ padding: "10px 12px", fontSize: "12px", fontWeight: 700 }}>
                            {b.id in transientStocks ? transientStocks[b.id] : "—"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                              background: status === "SAFE" ? "rgba(34,197,94,0.15)" : status === "WARNING" ? "rgba(245,158,11,0.15)" : status === "CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(107,114,128,0.15)",
                              color: status === "SAFE" ? "hsl(var(--green))" : status === "WARNING" ? "hsl(var(--amber))" : status === "CRITICAL" ? "hsl(var(--red))" : "hsl(var(--muted))",
                            }}>
                              {status}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            {status === "SAFE" || status === "NO DATA" ? (
                              <span style={{ color: "hsl(var(--muted))" }}>—</span>
                            ) : inCart ? (
                              <span style={{ color: "hsl(var(--green))", fontSize: "12px", fontWeight: 700 }}>✓ In Cart</span>
                            ) : (
                              <button
                                onClick={() => addToCart(b)}
                                style={{
                                  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                                  color: "hsl(var(--amber))", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
                                }}
                              >
                                + Rancang PO
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PO Logs Section */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <ShoppingCart style={{ width: 16, height: 16, color: "hsl(var(--accent))" }} />
              <span style={{ fontWeight: 700, fontSize: "13px" }}>Recent PO Logs</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#14142A" }}>
                  {["PO ID", "Bahan", "Vendor", "Qty", "Total", "Status", "Tanggal"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 12px", textAlign: "left", fontSize: "10px",
                      textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPOs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>
                      Belum ada Purchase Order. Buat PO di halaman PO Logs.
                    </td>
                  </tr>
                ) : (
                  recentPOs.map((po) => (
                    <tr
                      key={po.id}
                      style={{ borderTop: "1px solid hsl(var(--border))" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--accent))", fontWeight: 700 }}>
                        {po.id}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{po.namaBahan}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{po.namaVendor}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{po.qtyOrder} {po.satuanBeli}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", fontWeight: 700 }}>
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(po.totalHarga)}
                      </td>
                      <td style={{ padding: "10px 12px" }}><StatusBadge status={po.status} /></td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>
                        {new Date(po.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* PO Cart Sidebar (300px) */}
        <div style={{ ...card, width: "300px", flexShrink: 0, position: "sticky", top: "70px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "14px", marginBottom: "14px" }}>
            <span style={{ fontWeight: 800, fontSize: "14px" }}>Keranjang PO</span>
            <span style={{ background: "hsl(var(--accent))", color: "hsl(var(--bg))", borderRadius: "10px", padding: "2px 8px", fontSize: "10px", fontWeight: 800 }}>
              {cart.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "200px" }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", color: "hsl(var(--muted))", padding: "40px 0" }}>
                <ShoppingCart style={{ width: 32, height: 32, margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: "12px" }}>Keranjang masih kosong</p>
                <p style={{ fontSize: "10px", marginTop: "4px" }}>Klik Rancang PO di tabel inventory</p>
              </div>
            ) : (
              cart.map(c => (
                <div key={c.bahanId} style={{ border: "1px solid hsl(var(--border))", borderRadius: "8px", padding: "10px", background: "hsl(var(--surface))" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 700, fontSize: "12px" }}>{c.namaBahan}</span>
                    <button onClick={() => setCart(cart.filter(x => x.bahanId !== c.bahanId))} style={{ color: "hsl(var(--red))", background: "transparent", border: "none", cursor: "pointer", fontSize: "14px" }}>×</button>
                  </div>
                  <p style={{ fontSize: "11px", color: "hsl(var(--muted))", marginBottom: "8px" }}>{c.vendorName}</p>

                  {c.tipe === "raw_bulk" && (
                    <div style={{ background: "rgba(200,241,53,0.05)", border: "1px solid rgba(200,241,53,0.2)", borderRadius: "6px", padding: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "hsl(var(--accent))", fontSize: "10px", fontWeight: 700 }}>✦ AI Research (Raw/Bulk)</span>
                      <p style={{ fontSize: "10px", color: "hsl(var(--muted))", marginTop: "2px" }}>Menganalisis fluktuasi harga pasar...</p>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>Qty:</label>
                    <input type="number" value={c.qty} readOnly style={{ width: "60px", background: "hsl(var(--bg))", border: "1px solid hsl(var(--border2))", borderRadius: "4px", padding: "4px", color: "hsl(var(--text))", fontSize: "12px" }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <button
              disabled={creatingPO}
              style={{
                width: "100%", marginTop: "16px",
                background: creatingPO ? "rgba(107,114,128,0.3)" : "linear-gradient(135deg, #C8F135, #86EF3C)",
                color: creatingPO ? "hsl(var(--muted))" : "#0A0A0F",
                fontWeight: 800, padding: "12px", borderRadius: "8px", border: "none",
                cursor: creatingPO ? "not-allowed" : "pointer", fontSize: "13px"
              }}
              onClick={async () => {
                setCreatingPO(true);
                try {
                  let created = 0;
                  for (const c of cart) {
                    const b = bahanList.find(x => x.id === c.bahanId);
                    const res = await fetch("/api/purchase-orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        outletId: b?.outletId || "OUT-001",
                        vendorId: "VND-001",
                        bahanId: c.bahanId,
                        qtyOrder: c.qty,
                        hargaSatuan: b?.hargaBeli || 0,
                      }),
                    });
                    if (res.ok) created++;
                  }
                  alert(`${created} Draft PO berhasil dibuat!`);
                  setCart([]);
                } catch {
                  alert("Gagal membuat PO. Coba lagi.");
                } finally {
                  setCreatingPO(false);
                }
              }}
            >
              {creatingPO ? "Membuat PO..." : `+ Buat ${cart.length} Draft PO`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
