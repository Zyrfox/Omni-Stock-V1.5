"use client";

import { useState } from "react";
import { Users, Shield, UserCheck, Plus, Edit2, Trash2, X, Copy, CheckCircle2, RefreshCw, Eye, EyeOff } from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  nama: string;
  role: string;
  outletId: string | null;
  createdAt: string;
  mustChangePassword: boolean;
}

interface Outlet { id: string; namaOutlet: string; }

interface Props {
  currentUserId: string;
  userList: AppUser[];
  totalUsers: number;
  adminCount: number;
  managerCount: number;
  outletMap: Record<string, string>;
  outlets: Outlet[];
}

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

function genPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function UsersClient({ currentUserId, userList: initialUserList, totalUsers, adminCount, managerCount, outletMap, outlets }: Props) {
  const [userList, setUserList] = useState<AppUser[]>(initialUserList);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AppUser | null>(null);
  const [generatedPwd, setGeneratedPwd] = useState(genPassword);
  const [credential, setCredential] = useState<{ email: string; password: string; nama: string; role: string; outlet: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    role: "manager" as "admin" | "manager",
    outletId: "",
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          nama: formData.nama,
          role: formData.role,
          outletId: formData.outletId || undefined,
          password: generatedPwd,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat user");
        return;
      }

      const outletName = formData.outletId ? (outletMap[formData.outletId] ?? formData.outletId) : "Semua Outlet";
      setShowAddModal(false);
      setCredential({
        email: formData.email,
        password: generatedPwd,
        nama: formData.nama,
        role: formData.role.toUpperCase(),
        outlet: outletName,
      });

      // Add to local user list
      setUserList((prev) => [
        ...prev,
        {
          id: data.id,
          email: formData.email,
          nama: formData.nama,
          role: formData.role,
          outletId: formData.outletId || null,
          createdAt: new Date().toISOString(),
          mustChangePassword: true,
        },
      ]);

      // Reset form
      setFormData({ nama: "", email: "", role: "manager", outletId: "" });
      setGeneratedPwd(genPassword());
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${deleteConfirm.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menghapus user");
        return;
      }
      setUserList((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch {
      alert("Koneksi gagal");
    } finally {
      setDeleteLoading(false);
    }
  };

  const statCards = [
    { label: "Total Pengguna", value: userList.length, icon: Users, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Semua user" },
    { label: "Admin", value: userList.filter((u) => u.role === "admin").length, icon: Shield, color: "hsl(var(--accent))", bg: "rgba(200,241,53,0.1)", sub: "Full access" },
    { label: "Manager", value: userList.filter((u) => u.role === "manager").length, icon: UserCheck, color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)", sub: "Outlet access" },
  ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>User Management</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>Kelola pengguna sistem OmniStock</p>
      </div>

      {/* Admin Banner */}
      <div style={{ padding: "10px 16px", borderRadius: "8px", background: "rgba(200,241,53,0.08)", border: "1px solid rgba(200,241,53,0.25)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Shield style={{ width: 16, height: 16, color: "hsl(var(--accent))" }} />
        <span style={{ fontSize: "13px", color: "hsl(var(--accent))", fontWeight: 600 }}>Admin Only — Halaman ini hanya dapat diakses oleh Administrator</span>
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
          <span style={{ fontWeight: 700, fontSize: "13px" }}>Daftar Pengguna</span>
          <button
            style={{ background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, borderRadius: "8px", padding: "8px 16px", border: "none", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus style={{ width: 14, height: 14 }} /> Tambah Pengguna
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#14142A" }}>
              {["Username/Email", "Role", "Outlet", "Terdaftar Sejak", "Status", "Aksi"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {userList.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "hsl(var(--muted))", fontSize: "13px" }}>Belum ada pengguna.</td></tr>
            ) : (
              userList.map((u) => {
                const isMe = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    style={{ borderTop: "1px solid hsl(var(--border))" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "34px", height: "34px", borderRadius: "50%",
                          background: u.role === "admin" ? "rgba(200,241,53,0.2)" : "rgba(96,165,250,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: 700,
                          color: u.role === "admin" ? "hsl(var(--accent))" : "hsl(var(--blue))",
                          flexShrink: 0,
                        }}>
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>{u.nama}</span>
                            {isMe && (
                              <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", background: "rgba(200,241,53,0.2)", color: "hsl(var(--accent))" }}>ANDA</span>
                            )}
                          </div>
                          <span style={{ fontSize: "11px", color: "hsl(var(--muted))" }}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: u.role === "admin" ? "hsl(var(--accent))" : "hsl(var(--green))", flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", fontWeight: 600, color: u.role === "admin" ? "hsl(var(--accent))" : "hsl(var(--green))" }}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>
                      {u.outletId ? outletMap[u.outletId] ?? u.outletId : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{fmtDate(u.createdAt)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(34,197,94,0.15)", color: "hsl(var(--green))" }}>
                        ● Aktif
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {!isMe && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button style={{ background: "rgba(96,165,250,0.15)", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "hsl(var(--blue))" }}>
                            <Edit2 style={{ width: 12, height: 12 }} />
                          </button>
                          <button
                            style={{ background: "rgba(239,68,68,0.15)", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "hsl(var(--red))" }}
                            onClick={() => setDeleteConfirm(u)}
                          >
                            <Trash2 style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "480px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ height: "3px", background: "linear-gradient(90deg, #C8F135, #86EF3C, transparent)", borderRadius: "12px 12px 0 0", margin: "-18px -18px 18px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Tambah Pengguna</h2>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => { setShowAddModal(false); setError(null); }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {error && (
              <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "14px", fontSize: "12px", color: "hsl(var(--red))" }}>
                ⚠ {error}
              </div>
            )}

            <form style={{ display: "flex", flexDirection: "column", gap: "14px" }} onSubmit={handleSubmitUser}>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  style={inputStyle}
                  placeholder="Nama lengkap"
                  value={formData.nama}
                  onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Email Google *</label>
                <input
                  type="email"
                  required
                  style={inputStyle}
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Role</label>
                <select
                  style={inputStyle}
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as "admin" | "manager" }))}
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Outlet</label>
                <select
                  style={inputStyle}
                  value={formData.outletId}
                  onChange={(e) => setFormData((p) => ({ ...p, outletId: e.target.value }))}
                >
                  <option value="">— Pilih Outlet (opsional) —</option>
                  {outlets.map((o) => <option key={o.id} value={o.id}>{o.namaOutlet}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Password (auto-generated)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedPwd}
                    style={{ ...inputStyle, flex: 1, fontFamily: "monospace", background: "hsl(var(--bg))", color: "hsl(var(--accent))" }}
                  />
                  <button
                    type="button"
                    title="Regenerate password"
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", flexShrink: 0 }}
                    onClick={() => setGeneratedPwd(genPassword())}
                  >
                    <RefreshCw style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button
                  type="button"
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }}
                  onClick={() => { setShowAddModal(false); setError(null); }}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "8px 20px", borderRadius: "8px", border: "none",
                    background: loading ? "rgba(107,114,128,0.3)" : "linear-gradient(135deg, #C8F135, #86EF3C)",
                    color: loading ? "hsl(var(--muted))" : "#0A0A0F",
                    fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontSize: "13px",
                  }}
                >
                  {loading ? "Membuat..." : "✓ Buat Akun & Tampilkan Kredensial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credential Card (One-Time Display) */}
      {credential && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "480px", border: "1px solid rgba(200,241,53,0.3)", boxShadow: "0 0 40px rgba(200,241,53,0.1)" }}>
            <div style={{ height: "3px", background: "linear-gradient(90deg, #C8F135, #86EF3C, transparent)", borderRadius: "12px 12px 0 0", margin: "-18px -18px 18px" }} />
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <CheckCircle2 style={{ width: 40, height: 40, color: "hsl(var(--accent))", margin: "0 auto 10px" }} />
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>User Berhasil Dibuat</h2>
              <div style={{ marginTop: "10px", padding: "8px 14px", borderRadius: "6px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "12px", color: "hsl(var(--amber))", fontWeight: 600 }}>
                  ⚠ Tampil sekali saja — salin dan kirim ke user secara private
                </span>
              </div>
            </div>

            {[
              { label: "Email", value: credential.email, key: "email", color: "hsl(var(--accent))" },
              { label: "Password", value: credential.password, key: "pwd", color: "hsl(var(--amber))", secret: true },
            ].map((row) => (
              <div key={row.key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "hsl(var(--bg))", borderRadius: "8px", marginBottom: "10px", border: "1px solid hsl(var(--border))" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", color: "hsl(var(--muted))", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                  <p style={{ fontFamily: "monospace", fontSize: "13px", color: row.color }}>
                    {row.secret && !showPwd ? "••••••••••••" : row.value}
                  </p>
                </div>
                {row.secret && (
                  <button
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))", padding: "4px" }}
                    onClick={() => setShowPwd(!showPwd)}
                    title={showPwd ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                )}
                <button
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: copied === row.key ? "hsl(var(--green))" : "hsl(var(--muted))", padding: "4px" }}
                  onClick={() => copy(row.value, row.key)}
                  title="Copy"
                >
                  {copied === row.key ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            ))}

            <button
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: copied === "all" ? "hsl(var(--green))" : "hsl(var(--muted))", cursor: "pointer", fontSize: "13px", marginTop: "4px", fontWeight: 600 }}
              onClick={() => {
                const text = `[OMNI-STOCK Login]\nNama: ${credential.nama}\nEmail: ${credential.email}\nPassword: ${credential.password}\nRole: ${credential.role}\nOutlet: ${credential.outlet}\n\nLogin: ${appUrl}/login`;
                copy(text, "all");
              }}
            >
              {copied === "all" ? "✓ Disalin!" : "📋 Copy Semua Kredensial (Siap Kirim)"}
            </button>

            <p style={{ fontSize: "11px", color: "hsl(var(--muted))", textAlign: "center", marginTop: "10px" }}>
              User wajib ganti password setelah login pertama kali.
            </p>

            <button
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, cursor: "pointer", fontSize: "13px", marginTop: "8px" }}
              onClick={() => setCredential(null)}
            >
              ✓ Selesai, Tutup
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "380px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 style={{ width: 18, height: 18, color: "hsl(var(--red))" }} />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Hapus Pengguna</h2>
            </div>
            <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginBottom: "16px", lineHeight: 1.6 }}>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <span style={{ color: "hsl(var(--red))", fontWeight: 700 }}>{deleteConfirm.email}</span>?
              <br />Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                style={{
                  padding: "8px 20px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.1)", color: "hsl(var(--red))", fontWeight: 700, cursor: deleteLoading ? "not-allowed" : "pointer", fontSize: "13px",
                }}
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
