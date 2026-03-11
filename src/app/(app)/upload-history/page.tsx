export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { salesTransactions, outlets } from "@/lib/db/schema";
import { count, sql, desc } from "drizzle-orm";

export default async function UploadHistoryPage() {
  // Group sales_transactions by upload_batch_id to derive upload sessions
  const uploadBatches = await db
    .select({
      uploadBatchId: salesTransactions.uploadBatchId,
      outletId: salesTransactions.outletId,
      itemsCount: count(salesTransactions.id),
      earliestDate: sql<string>`min(${salesTransactions.tanggalTransaksi})`,
      createdAt: sql<string>`min(${salesTransactions.createdAt})`,
    })
    .from(salesTransactions)
    .groupBy(salesTransactions.uploadBatchId, salesTransactions.outletId)
    .orderBy(desc(sql`min(${salesTransactions.createdAt})`));

  const outletList = await db.select().from(outlets);
  const outletMap = Object.fromEntries(outletList.map((o) => [o.id, o.namaOutlet]));

  return (
    <div style={{ color: "hsl(var(--text))" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Upload History</h1>
        <p style={{ fontSize: "13px", color: "hsl(var(--muted))", marginTop: "2px" }}>
          Riwayat upload data Pawoon export
        </p>
      </div>

      <div
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "12px",
          padding: "18px",
        }}
      >
        <div style={{ marginBottom: "14px" }}>
          <span style={{ fontWeight: 700, fontSize: "13px" }}>Upload Sessions</span>
          <span style={{ marginLeft: "8px", fontSize: "10px", background: "rgba(107,114,128,0.15)", color: "hsl(var(--muted))", padding: "2px 7px", borderRadius: "4px" }}>
            {uploadBatches.length} sessions
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#14142A" }}>
              {["Batch ID", "Outlet", "Items Parsed", "Periode Data", "Status", "Tanggal Upload"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase", color: "hsl(var(--muted))", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uploadBatches.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "60px 32px", textAlign: "center" }}>
                  <div style={{ color: "hsl(var(--muted))" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>Belum Ada Upload</p>
                    <p style={{ fontSize: "13px" }}>Upload file Pawoon export dari halaman Dashboard untuk mulai.</p>
                  </div>
                </td>
              </tr>
            ) : (
              uploadBatches.map((batch, idx) => {
                const batchNum = String(idx + 1).padStart(3, "0");
                return (
                  <tr
                    key={batch.uploadBatchId}
                    style={{ borderTop: "1px solid hsl(var(--border))" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#14142A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "hsl(var(--muted))" }}>
                      UPL-{batchNum}
                      <div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.7, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {batch.uploadBatchId}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(96,165,250,0.15)", color: "hsl(var(--blue))" }}>
                        {outletMap[batch.outletId] ?? batch.outletId}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 700 }}>{batch.itemsCount}</td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>
                      {batch.earliestDate ? new Date(batch.earliestDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "rgba(34,197,94,0.15)", color: "hsl(var(--green))" }}>
                        ✓ Success
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: "12px", color: "hsl(var(--muted))" }}>
                      {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
