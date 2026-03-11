"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengganti password");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: "hsl(var(--bg))" }}
    >
      <div
        className="relative w-[420px] overflow-hidden rounded-[18px] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accentD)), transparent)" }} />

        <div className="p-8">
          <h1 className="text-[22px] font-bold" style={{ color: "hsl(var(--text))" }}>
            Ganti Password
          </h1>
          <p className="mt-1.5 text-xs" style={{ color: "hsl(var(--sub))" }}>
            Anda harus mengganti password sebelum melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold" style={{ color: "hsl(var(--sub))" }}>
                Password Baru
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
                className="w-full rounded-[9px] border px-3.5 py-[11px] text-[13px] transition-colors focus:outline-none"
                style={{
                  backgroundColor: "hsl(var(--surface))",
                  borderColor: "hsl(var(--border2))",
                  color: "hsl(var(--text))",
                }}
                onFocus={(e) => (e.target.style.borderColor = "hsl(var(--accent))")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border2))")}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold" style={{ color: "hsl(var(--sub))" }}>
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password baru"
                required
                className="w-full rounded-[9px] border px-3.5 py-[11px] text-[13px] transition-colors focus:outline-none"
                style={{
                  backgroundColor: "hsl(var(--surface))",
                  borderColor: "hsl(var(--border2))",
                  color: "hsl(var(--text))",
                }}
                onFocus={(e) => (e.target.style.borderColor = "hsl(var(--accent))")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border2))")}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 rounded-[7px] border px-3 py-2.5 text-[11px]"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  borderColor: "rgba(239,68,68,0.2)",
                  color: "hsl(var(--red))",
                }}
              >
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] border-none py-3.5 text-[13px] font-extrabold transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: loading
                  ? "hsl(var(--surface))"
                  : "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accentD)))",
                color: loading ? "hsl(var(--muted))" : "hsl(var(--bg))",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Menyimpan...
                </span>
              ) : (
                "→ Simpan Password Baru"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[10px]" style={{ color: "hsl(var(--muted))" }}>
            Easy Going Group © 2026 · OMNI-STOCK
          </p>
        </div>
      </div>
    </div>
  );
}
