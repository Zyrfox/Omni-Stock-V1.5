"use client";

import { useState } from "react";
import { Users, Shield, UserCheck, Plus, Edit2, Trash2, X, Copy, CheckCircle2, RefreshCw } from "lucide-react";

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

const fmt = (d: string) =>
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

export function UsersClient({ currentUserId, userList, totalUsers, adminCount, managerCount, outletMap, outlets }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AppUser | null>(null);
  const [generatedPwd, setGeneratedPwd] = useState(genPassword);
  const [credential, setCredential] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const statCards = [
    { label: "Total Pengguna", value: totalUsers, icon: Users, color: "hsl(var(--blue))", bg: "rgba(96,165,250,0.1)", sub: "Semua user" },
    { label: "Admin", value: adminCount, icon: Shield, color: "hsl(var(--accent))", bg: "rgba(200,241,53,0.1)", sub: "Full access" },
    { label: "Manager", value: managerCount, icon: UserCheck, color: "hsl(var(--green))", bg: "rgba(34,197,94,0.1)", sub: "Outlet access" },
  ];

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
            <Plus style={{ width: 14, height: 14 }} /> Tambah User
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
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: u.role === "admin" ? "rgba(200,241,53,0.2)" : "rgba(96,165,250,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: 700,
                          color: u.role === "admin" ? "hsl(var(--accent))" : "hsl(var(--blue))",
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
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: u.role === "admin" ? "hsl(var(--accent))" : "hsl(var(--green))" }} />
                        <span style={{ fontSize: "12px", fontWeight: 600, color: u.role === "admin" ? "hsl(var(--accent))" : "hsl(var(--green))" }}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>
                      {u.outletId ? outletMap[u.outletId] ?? u.outletId : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>{fmt(u.createdAt)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(34,197,94,0.15)", color: "hsl(var(--green))" }}>
                        Aktif
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Tambah Pengguna</h2>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "hsl(var(--muted))" }} onClick={() => setShowAddModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const email = fd.get("email") as string;
                setShowAddModal(false);
                setCredential({ email, password: generatedPwd });
              }}
            >
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Nama Lengkap *</label>
                <input type="text" name="nama" required style={inputStyle} placeholder="Nama lengkap" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Email Google *</label>
                <input type="email" name="email" required style={inputStyle} placeholder="email@example.com" />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Role</label>
                <select name="role" style={inputStyle}>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "hsl(var(--muted))", display: "block", marginBottom: "6px" }}>Outlet</label>
                <select name="outletId" style={inputStyle}>
                  <option value="">— Pilih Outlet —</option>
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
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer" }}
                    onClick={() => setGeneratedPwd(genPassword())}
                  >
                    <RefreshCw style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button type="button" style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }} onClick={() => setShowAddModal(false)}>Batal</button>
                <button type="submit" style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, cursor: "pointer", fontSize: "13px" }}>Buat User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credential Card */}
      {credential && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "420px", border: "1px solid rgba(200,241,53,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <CheckCircle2 style={{ width: 40, height: 40, color: "hsl(var(--accent))", margin: "0 auto 10px" }} />
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>User Berhasil Dibuat</h2>
              <p style={{ fontSize: "12px", color: "hsl(var(--red))", marginTop: "6px", fontWeight: 600 }}>
                Simpan kredensial ini! Tidak akan ditampilkan kembali.
              </p>
            </div>

            {[
              { label: "Email", value: credential.email, key: "email" },
              { label: "Password", value: credential.password, key: "pwd" },
            ].map((row) => (
              <div key={row.key} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "hsl(var(--bg))", borderRadius: "8px", marginBottom: "10px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", color: "hsl(var(--muted))", marginBottom: "2px" }}>{row.label}</p>
                  <p style={{ fontFamily: "monospace", fontSize: "13px", color: "hsl(var(--text))" }}>{row.value}</p>
                </div>
                <button
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: copied === row.key ? "hsl(var(--accent))" : "hsl(var(--muted))" }}
                  onClick={() => copy(row.value, row.key)}
                >
                  {copied === row.key ? <CheckCircle2 style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            ))}

            <button
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "transparent", borderWidth: "1px", borderStyle: "solid", borderColor: "hsl(var(--border2))", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px", marginTop: "4px" }}
              onClick={() => { copy(`Email: ${credential.email}\nPassword: ${credential.password}`, "all"); }}
            >
              {copied === "all" ? "✓ Disalin!" : "Copy Semua"}
            </button>
            <button
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #C8F135, #86EF3C)", color: "#0A0A0F", fontWeight: 800, cursor: "pointer", fontSize: "13px", marginTop: "8px" }}
              onClick={() => setCredential(null)}
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...card, width: "380px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Trash2 style={{ width: 20, height: 20, color: "hsl(var(--red))" }} />
              <h2 style={{ fontWeight: 700, fontSize: "16px" }}>Hapus Pengguna</h2>
            </div>
            <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginBottom: "16px" }}>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <span style={{ color: "hsl(var(--red))", fontWeight: 700 }}>{deleteConfirm.email}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid hsl(var(--border2))", background: "transparent", color: "hsl(var(--muted))", cursor: "pointer", fontSize: "13px" }} onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "hsl(var(--red))", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                onClick={() => { alert(`Delete ${deleteConfirm.email} — connect to server action`); setDeleteConfirm(null); }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
