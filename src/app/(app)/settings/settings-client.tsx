"use client";

import { Shield, Database, Key, Info, CheckCircle2, AlertCircle, Lock, ArrowRight } from "lucide-react";

interface Props {
  isMigrationDone: boolean;
}

const card = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "18px",
} as const;

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid hsl(var(--border))" }}>
      <span style={{ fontSize: "12px", color: "hsl(var(--muted))" }}>{label}</span>
      <span style={{
        fontSize: "12px", fontWeight: 600,
        color: accent ? "hsl(var(--accent))" : "hsl(var(--text))",
        fontFamily: accent ? "monospace" : undefined,
      }}>
        {value}
      </span>
    </div>
  );
}

export function SettingsClient({ isMigrationDone }: Props) {
  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>System Settings</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>Konfigurasi sistem, database, dan informasi teknis</p>
      </div>

      {/* Admin Banner */}
      <div style={{ padding: "10px 16px", borderRadius: "8px", background: "rgba(200,241,53,0.08)", border: "1px solid rgba(200,241,53,0.25)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Shield style={{ width: 16, height: 16, color: "hsl(var(--accent))" }} />
        <span style={{ fontSize: "13px", color: "hsl(var(--accent))", fontWeight: 600 }}>Admin Only — Pengaturan sistem sensitif</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Card 1: One-Way Bridge Migration */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Database style={{ width: 18, height: 18, color: isMigrationDone ? "hsl(var(--green))" : "hsl(var(--amber))" }} />
            <span style={{ fontWeight: 700, fontSize: "14px" }}>One-Way Bridge Migration</span>
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
            background: isMigrationDone ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
            border: `1px solid ${isMigrationDone ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            {isMigrationDone
              ? <CheckCircle2 style={{ width: 16, height: 16, color: "hsl(var(--green))" }} />
              : <AlertCircle style={{ width: 16, height: 16, color: "hsl(var(--amber))" }} />}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: isMigrationDone ? "hsl(var(--green))" : "hsl(var(--amber))" }}>
                {isMigrationDone ? "Migrasi Selesai" : "Migrasi Diperlukan"}
              </p>
              <p style={{ fontSize: "11px", color: "hsl(var(--muted))", marginTop: "2px" }}>
                {isMigrationDone ? "Data telah dimigrasikan ke Supabase" : "Sinkronisasi awal belum dilakukan"}
              </p>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "hsl(var(--muted))", marginBottom: "16px", lineHeight: 1.6 }}>
            Proses migrasi satu arah dari sistem lama ke Supabase PostgreSQL. Setelah selesai, proses tidak dapat dibalik.
          </p>

          <button
            style={{
              width: "100%", padding: "10px", borderRadius: "8px", border: "none",
              background: isMigrationDone
                ? "rgba(107,114,128,0.15)"
                : "linear-gradient(135deg, #C8F135, #86EF3C)",
              color: isMigrationDone ? "hsl(var(--muted))" : "#0A0A0F",
              fontWeight: 800, cursor: isMigrationDone ? "not-allowed" : "pointer",
              fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            disabled={isMigrationDone}
            onClick={() => !isMigrationDone && alert("Jalankan migrasi — connect to server action")}
          >
            {isMigrationDone
              ? <><Lock style={{ width: 14, height: 14 }} /> Terkunci — Sudah Selesai</>
              : <><ArrowRight style={{ width: 14, height: 14 }} /> Mulai Sinkronisasi</>}
          </button>
        </div>

        {/* Card 2: Supabase PITR Backup */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Database style={{ width: 18, height: 18, color: "hsl(var(--green))" }} />
            <span style={{ fontWeight: 700, fontSize: "14px" }}>Supabase PITR Backup</span>
          </div>

          <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 style={{ width: 16, height: 16, color: "hsl(var(--green))" }} />
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "hsl(var(--green))" }}>PITR Active</p>
              <p style={{ fontSize: "11px", color: "hsl(var(--muted))", marginTop: "2px" }}>Point-in-Time Recovery diaktifkan</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <InfoRow label="Retention Period" value="7 hari" />
            <InfoRow label="Region" value="ap-southeast-1" />
            <InfoRow label="Provider" value="Supabase PostgreSQL" />
            <InfoRow label="Storage" value="Pro Plan" />
            <InfoRow label="Last Backup" value="Auto (setiap hari)" />
          </div>
        </div>

        {/* Card 3: Auth */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Key style={{ width: 18, height: 18, color: "hsl(var(--blue))" }} />
            <span style={{ fontWeight: 700, fontSize: "14px" }}>Authentication (Better Auth)</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <InfoRow label="Provider" value="Email + Password" />
            <InfoRow label="Library" value="better-auth ^1.2.0" />
            <InfoRow label="Session Duration" value="7 hari JWT" />
            <InfoRow label="Domain" value="*.easy-going.com" />
            <InfoRow label="Google OAuth" value="Opsional (env)" />
            <InfoRow label="Email Verification" value="Tidak Diperlukan" />
          </div>
        </div>

        {/* Card 4: System Info */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Info style={{ width: 18, height: 18, color: "hsl(var(--accent))" }} />
            <span style={{ fontWeight: 700, fontSize: "14px" }}>System Information</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            <InfoRow label="Version" value="1.5.0" accent />
            <InfoRow label="Framework" value="Next.js 15" accent />
            <InfoRow label="Database" value="Supabase PostgreSQL" accent />
            <InfoRow label="ORM" value="Drizzle ORM" accent />
            <InfoRow label="AI Engine" value="Gemini API" accent />
            <InfoRow label="Deployment" value="Vercel" accent />
            <InfoRow label="ID Format" value="PREFIX-NNN" accent />
          </div>
        </div>
      </div>
    </div>
  );
}
