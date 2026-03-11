"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

type RoleTab = "STAFF" | "SPV" | "MANAGER";

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<RoleTab>("MANAGER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await signIn.email({ email, password });
      if (response.error) throw new Error(response.error.message || "Login gagal");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden" style={{ backgroundColor: "hsl(var(--bg))" }}>
      {/* Blob Decorations */}
      <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(var(--blue)) 0%, transparent 70%)" }} />

      {/* Login Card */}
      <div className="relative w-[420px] overflow-hidden rounded-[18px] shadow-[0_32px_80px_rgba(0,0,0,0.6)]" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        {/* Accent Line */}
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accentD)), transparent)" }} />

        <div className="p-8">
          {/* Logo SVG */}
          <svg className="mx-auto mb-3.5" width="52" height="28" viewBox="0 0 52 28">
            <circle cx="10" cy="14" r="9" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
            <circle cx="26" cy="14" r="9" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
            <circle cx="42" cy="14" r="9" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
          </svg>

          {/* Title */}
          <h1 className="m-0 text-[22px] font-bold" style={{ color: "hsl(var(--text))" }}>
            Selamat Datang
          </h1>
          <p className="mt-1.5 text-xs" style={{ color: "hsl(var(--sub))" }}>
            Masuk ke OMNI-STOCK Dashboard
          </p>

          {/* Role Tabs */}
          <div className="mt-6 flex justify-center border-b pb-0" style={{ borderColor: "hsl(var(--border))" }}>
            {(["STAFF", "SPV", "MANAGER"] as RoleTab[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className="px-5 py-2 text-[11px] font-bold uppercase transition-colors"
                style={{
                  color: activeRole === role ? "hsl(var(--accent))" : "hsl(var(--muted))",
                  borderBottom: activeRole === role ? "2px solid hsl(var(--accent))" : "2px solid transparent",
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {/* Email Field */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold" style={{ color: "hsl(var(--sub))" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@easygoing.com"
                required
                className="w-full rounded-[9px] border px-3.5 py-[11px] text-[13px] transition-colors focus:outline-none"
                style={{
                  backgroundColor: "hsl(var(--surface))",
                  borderColor: "hsl(var(--border2))",
                  color: "hsl(var(--text))",
                }}
                onFocus={(e) => e.target.style.borderColor = "hsl(var(--accent))"}
                onBlur={(e) => e.target.style.borderColor = "hsl(var(--border2))"}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold" style={{ color: "hsl(var(--sub))" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-[9px] border px-3.5 py-[11px] pr-11 text-[13px] transition-colors focus:outline-none"
                  style={{
                    backgroundColor: "hsl(var(--surface))",
                    borderColor: "hsl(var(--border2))",
                    color: "hsl(var(--text))",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "hsl(var(--accent))"}
                  onBlur={(e) => e.target.style.borderColor = "hsl(var(--border2))"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: "hsl(var(--muted))" }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-[7px] border px-3 py-2.5 text-[11px]" style={{ backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)", color: "hsl(var(--red))" }}>
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] border-none py-3.5 text-[13px] font-extrabold transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: loading ? "hsl(var(--surface))" : "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accentD)))",
                color: loading ? "hsl(var(--muted))" : "hsl(var(--bg))",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Memverifikasi...
                </span>
              ) : (
                "→ Masuk ke Dashboard"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-[10px]" style={{ color: "hsl(var(--muted))" }}>
            Easy Going Group © 2026 · OMNI-STOCK
          </p>
        </div>
      </div>
    </div>
  );
}
