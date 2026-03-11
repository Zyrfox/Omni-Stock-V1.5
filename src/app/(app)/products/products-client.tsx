"use client";

import { useState } from "react";
import { Package, ChefHat, Layers, Edit2, X, Plus } from "lucide-react";

interface Bahan {
  id: string;
  namaBahan: string;
  tipeBahan: string;
  kategoriBahan: string;
  satuanBeli: string;
  satuanDapur: string;
  stokMinimum: number;
  hargaBeli: number;
  isiSatuan: number;
  hargaPerSatuanPorsi: number;
  outletId: string;
}

interface MenuItem {
  id: string;
  namaMenu: string;
  outletId: string;
  kategori: string | null;
  hargaJual: number;
  totalCogs: number;
}

interface Recipe {
  parentId: string;
  parentType: string;
  itemId: string;
  itemType: string;
  qty: number;
}

interface Outlet { id: string; namaOutlet: string; }
interface SemiFinished { id: string; namaSemiFinished: string; satuan: string; outletId: string; }

interface Props {
  bahanCount: number;
  menuCount: number;
  bomCount: number;
  bahanList: Bahan[];
  menuList: MenuItem[];
  recipes: Recipe[];
  outlets: Outlet[];
  semiFinishedList: SemiFinished[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

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

export function ProductsClient({
  bahanCount, menuCount, bomCount, bahanList, menuList, recipes, outlets, semiFinishedList,
}: Props) {
  const [tab, setTab] = useState<"bahan" | "resep" | "menu">("bahan");
  const [showAddBahan, setShowAddBahan] = useState(false);
  const [showBomEditor, setShowBomEditor] = useState<string | null>(null);
  const [bomRows, setBomRows] = useState<{ id: string; type: "bahan_dasar" | "semi_finished"; itemId: string; qty: number }[]>([]);

  // Open BOM Editor and pre-fill rows
  const handleOpenBomEditor = (menuId: string) => {
    const existing = recipes.filter(r => r.parentId === menuId).map((r, i) => ({
      id: Date.now().toString() + i,
      type: r.itemType as "bahan_dasar" | "semi_finished",
      itemId: r.itemId,
      qty: r.qty
    }));
    setBomRows(existing.length > 0 ? existing : [{ id: Date.now().toString(), type: "bahan_dasar", itemId: "", qty: 1 }]);
    setShowBomEditor(menuId);
  };

  // Group recipes by parentId
  const recipeMap = new Map<string, Recipe[]>();
  for (const r of recipes) {
    const arr = recipeMap.get(r.parentId) ?? [];
    arr.push(r);
    recipeMap.set(r.parentId, arr);
  }

  const statCards = [
    { label: "Master Bahan Baku", value: bahanCount, icon: Package, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Bahan terdaftar" },
    { label: "Bill of Materials", value: bomCount, icon: Layers, color: "hsl(var(--amber))", bg: "rgba(245,158,11,0.1)", sub: "Menu dengan resep" },
    { label: "Master Menu Final", value: menuCount, icon: ChefHat, color: "hsl(var(--accent))", bg: "rgba(200,241,53,0.1)", sub: "Total menu" },
  ];

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Products & Recipes</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>
          Master bahan baku, bill of materials, dan menu final
        </p>
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

      {/* Tabs */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid hsl(var(--border))", paddingBottom: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={tabStyle(tab === "bahan")} onClick={() => setTab("bahan")}>Master Bahan</button>
            <button style={tabStyle(tab === "resep")} onClick={() => setTab("resep")}>Master Resep (BOM)</button>
            <button style={tabStyle(tab === "menu")} onClick={() => setTab("menu")}>Master Menu</button>
          </div>
          {tab === "bahan" && (
            <button
              style={{
                background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F",
                fontWeight: 800, borderRadius: "8px", padding: "8px 16px", border: "none",
                cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px",
              }}
              onClick={() => setShowAddBahan(true)}
            >
              <Plus style={{ width: 14, height: 14 }} /> Tambah Bahan
            </button>
          )}
        </div>

        {/* Tab 1: Master Bahan */}
        {tab === "bahan" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#14142A" }}>
                  {["ID", "Nama Bahan", "Tipe", "Kemasan Beli", "Satuan Dapur", "Min. Stok", "Harga Beli", "Isi/Yield", "Harga/Porsi", "Aksi"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bahanList.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada bahan. Tambahkan bahan pertama Anda.</td></tr>
                ) : (
                  bahanList.map((b) => (
                    <tr key={b.id} style={{ borderTop: "1px solid hsl(var(--border))" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--muted))" }}>{b.id}</td>
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
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{b.satuanDapur}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{b.stokMinimum}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{fmt(b.hargaBeli)}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px" }}>{b.isiSatuan}</td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700, color: "hsl(var(--accent))" }}>{fmt(b.hargaPerSatuanPorsi)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))", padding: "4px" }}>
                          <Edit2 style={{ width: 14, height: 14 }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Master Resep BOM */}
        {tab === "resep" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["ID Menu", "Nama Menu", "Outlet", "Komposisi", "Total COGS"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menuList.filter((m) => recipeMap.has(m.id)).length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada BOM terdaftar.</td></tr>
              ) : (
                menuList.filter((m) => recipeMap.has(m.id)).map((m) => {
                  const r = recipeMap.get(m.id) ?? [];
                  const outlet = outlets.find((o) => o.id === m.outletId);
                  return (
                    <tr key={m.id} style={{ borderTop: "1px solid hsl(var(--border))" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--muted))" }}>{m.id}</td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{m.namaMenu}</td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{outlet?.namaOutlet ?? m.outletId}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {r.slice(0, 3).map((item, i) => (
                            <span key={i} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(96,165,250,0.1)", color: "hsl(var(--blue))" }}>
                              {item.itemId} ×{item.qty}
                            </span>
                          ))}
                          {r.length > 3 && (
                            <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(107,114,128,0.1)", color: "hsl(var(--muted))" }}>
                              +{r.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700, color: "hsl(var(--accent))" }}>{fmt(m.totalCogs)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Tab 3: Master Menu */}
        {tab === "menu" && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#14142A" }}>
                {["ID Menu", "Nama Menu", "Kategori", "Outlet", "Recipe", "Total COGS", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menuList.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada menu terdaftar.</td></tr>
              ) : (
                menuList.map((m) => {
                  const outlet = outlets.find((o) => o.id === m.outletId);
                  const hasRecipe = recipeMap.has(m.id);
                  return (
                    <tr key={m.id} style={{ borderTop: "1px solid hsl(var(--border))" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--muted))" }}>{m.id}</td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600 }}>{m.namaMenu}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))" }}>
                          {m.kategori ? m.kategori.toUpperCase() : "—"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{outlet?.namaOutlet ?? m.outletId}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {hasRecipe ? (
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(34,197,94,0.15)", color: "hsl(var(--green))" }}>
                            ✓ Has Recipe
                          </span>
                        ) : (
                          <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(107,114,128,0.1)", color: "hsl(var(--muted))" }}>
                            No Recipe
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700, color: "hsl(var(--accent))" }}>{fmt(m.totalCogs)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <button
                          style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", cursor: "pointer", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))", fontWeight: 600 }}
                          onClick={() => handleOpenBomEditor(m.id)}
                        >
                          Edit Resep
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Bahan Modal */}
      {showAddBahan && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ ...card, width: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Tambah Bahan Baku</h2>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => setShowAddBahan(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form style={{ display: "flex", flexDirection: "column", gap: "14px" }} onSubmit={(e) => { e.preventDefault(); alert("Connect to API action"); }}>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Nama Bahan *</label>
                <input type="text" required style={inputStyle} placeholder="Contoh: Tepung Terigu Premium" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Tipe Bahan *</label>
                <select style={inputStyle}>
                  <option value="packaged">Packaged</option>
                  <option value="raw_bulk">Raw Bulk</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Kemasan Beli</label>
                  <input type="text" style={inputStyle} placeholder="kg" />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Satuan Dapur</label>
                  <input type="text" style={inputStyle} placeholder="gram" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Batas Min Stok</label>
                  <input type="number" style={inputStyle} placeholder="0" min="0" />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Isi Kemasan (Yield)</label>
                  <input type="number" style={inputStyle} placeholder="1" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Harga Beli Kemasan (Rp)</label>
                <input type="number" style={inputStyle} placeholder="0" min="0" />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button type="button" style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }} onClick={() => setShowAddBahan(false)}>
                  Batal
                </button>
                <button type="submit" style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, cursor: "pointer", fontSize: "13px" }}>
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOM Editor Modal */}
      {showBomEditor && (() => {
        const targetMenu = menuList.find(m => m.id === showBomEditor);

        // Calculate Total COGS Real-time
        const currentTotalCogs = bomRows.reduce((sum, row) => {
          if (!row.itemId) return sum;
          if (row.type === "bahan_dasar") {
            const b = bahanList.find(x => x.id === row.itemId);
            return sum + (b ? b.hargaPerSatuanPorsi * row.qty : 0);
          } else {
            // Semi_finished: ideally we calculate the sub-cogs of SFG recursively. For now, assuming SFG has a fixed cost or calculated later.
            return sum + 0;
          }
        }, 0);

        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, width: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: "16px" }}>BOM Editor (Resep)</h2>
                  <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "4px" }}>
                    Target: <strong style={{ color: "hsl(var(--text))" }}>{targetMenu?.namaMenu}</strong>
                  </p>
                </div>
                <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => setShowBomEditor(null)}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

              {/* Rows Editor */}
              <div style={{ overflowY: "auto", flex: 1, paddingRight: "10px" }}>
                {bomRows.map((row, index) => {
                  const b = row.type === "bahan_dasar" ? bahanList.find(x => x.id === row.itemId) : null;
                  const sf = row.type === "semi_finished" ? semiFinishedList.find(x => x.id === row.itemId) : null;
                  const unit = row.type === "bahan_dasar" ? b?.satuanDapur : sf?.satuan;
                  const cogs = row.type === "bahan_dasar" ? (b ? b.hargaPerSatuanPorsi * row.qty : 0) : 0;

                  return (
                    <div key={row.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", background: "hsl(var(--surface))", padding: "10px", borderRadius: "8px", border: "1px solid hsl(var(--border2))" }}>
                      {/* Tipe Select */}
                      <div style={{ width: "120px" }}>
                        <select
                          style={{ ...inputStyle, padding: "6px" }}
                          value={row.type}
                          onChange={(e) => {
                            const newRows = [...bomRows];
                            newRows[index] = { ...row, type: e.target.value as any, itemId: "" };
                            setBomRows(newRows);
                          }}
                        >
                          <option value="bahan_dasar">Bahan</option>
                          <option value="semi_finished">Sub-Resep</option>
                        </select>
                      </div>

                      {/* Item Select */}
                      <div style={{ flex: 1 }}>
                        <select
                          style={{ ...inputStyle, padding: "6px" }}
                          value={row.itemId}
                          onChange={(e) => {
                            const newRows = [...bomRows];
                            newRows[index].itemId = e.target.value;
                            setBomRows(newRows);
                          }}
                        >
                          <option value="">-- Pilih Item --</option>
                          {row.type === "bahan_dasar" && bahanList.map(b => <option key={b.id} value={b.id}>{b.namaBahan}</option>)}
                          {row.type === "semi_finished" && semiFinishedList.map(s => <option key={s.id} value={s.id}>{s.namaSemiFinished}</option>)}
                        </select>
                      </div>

                      {/* Qty */}
                      <div style={{ width: "70px" }}>
                        <input
                          type="number" min="0" step="0.01" style={{ ...inputStyle, padding: "6px" }}
                          value={row.qty}
                          onChange={(e) => {
                            const newRows = [...bomRows];
                            newRows[index].qty = Number(e.target.value) || 0;
                            setBomRows(newRows);
                          }}
                        />
                      </div>

                      {/* Unit */}
                      <div style={{ width: "60px", fontSize: "11px", color: "hsl(var(--muted))" }}>
                        {unit || "—"}
                      </div>

                      {/* COGS */}
                      <div style={{ width: "90px", fontWeight: 700, fontSize: "12px", color: "hsl(var(--accent))", textAlign: "right" }}>
                        {cogs > 0 ? fmt(cogs) : "Rp 0"}
                      </div>

                      {/* Delete */}
                      <button
                        style={{ width: "30px", background: "transparent", border: "none", color: "hsl(var(--red))", cursor: "pointer", opacity: 0.7 }}
                        onClick={() => setBomRows(bomRows.filter((_, i) => i !== index))}
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  style={{ background: "transparent", border: "1px dashed hsl(var(--border2))", color: "hsl(var(--blue))", padding: "10px", width: "100%", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                  onClick={() => setBomRows([...bomRows, { id: Date.now().toString(), type: "bahan_dasar", itemId: "", qty: 1 }])}
                >
                  <Plus style={{ width: 14, height: 14 }} /> Tambah Komposisi
                </button>
              </div>

              {/* Bottom Tracker and Actions */}
              <div style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "16px", marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textTransform: "uppercase" }}>Total COGS Saat Ini</p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "hsl(var(--accent))" }}>{fmt(currentTotalCogs)}</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", fontSize: "13px", cursor: "pointer" }} onClick={() => setShowBomEditor(null)}>
                    Batal
                  </button>
                  <button style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, cursor: "pointer", fontSize: "13px" }} onClick={() => alert("Simpan Multi-Level Resep")}>
                    Simpan Multi-Level Resep
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
