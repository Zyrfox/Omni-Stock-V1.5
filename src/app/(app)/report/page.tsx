export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { purchaseOrders, masterBahan, masterVendor } from "@/lib/db/schema";
import { count, eq, sum, sql, desc } from "drizzle-orm";
import { ReportClient } from "./report-client";

export default async function ReportPage() {
  // Monthly totals for chart (current year)
  const currentYear = new Date().getFullYear();
  const monthlyData = await db
    .select({
      month: sql<number>`extract(month from ${purchaseOrders.createdAt})::int`,
      total: sum(purchaseOrders.totalHarga),
    })
    .from(purchaseOrders)
    .where(sql`extract(year from ${purchaseOrders.createdAt}) = ${currentYear}`)
    .groupBy(sql`extract(month from ${purchaseOrders.createdAt})`);

  // This month stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthStats] = await db
    .select({
      total: sum(purchaseOrders.totalHarga),
      c: count(),
    })
    .from(purchaseOrders)
    .where(sql`${purchaseOrders.createdAt} >= ${startOfMonth.toISOString()} and ${purchaseOrders.status} = 'received'`);

  // Top 5 bahan by total pengeluaran
  const topBahan = await db
    .select({
      bahanId: purchaseOrders.bahanId,
      namaBahan: masterBahan.namaBahan,
      total: sum(purchaseOrders.totalHarga),
    })
    .from(purchaseOrders)
    .leftJoin(masterBahan, eq(purchaseOrders.bahanId, masterBahan.id))
    .where(eq(purchaseOrders.status, "received"))
    .groupBy(purchaseOrders.bahanId, masterBahan.namaBahan)
    .orderBy(desc(sum(purchaseOrders.totalHarga)))
    .limit(5);

  // Vendor performance
  const vendorPerf = await db
    .select({
      vendorId: purchaseOrders.vendorId,
      namaVendor: masterVendor.namaVendor,
      estimasiPengiriman: masterVendor.estimasiPengiriman,
      poCount: count(purchaseOrders.id),
    })
    .from(purchaseOrders)
    .leftJoin(masterVendor, eq(purchaseOrders.vendorId, masterVendor.id))
    .groupBy(purchaseOrders.vendorId, masterVendor.namaVendor, masterVendor.estimasiPengiriman);

  // Total pengeluaran all time
  const [totalAllTime] = await db
    .select({ total: sum(purchaseOrders.totalHarga) })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.status, "received"));

  // Avg lead time
  const [avgLead] = await db
    .select({ avg: sql<number>`avg(${masterVendor.estimasiPengiriman})` })
    .from(masterVendor);

  // Build monthly array (12 months)
  const monthArr = Array.from({ length: 12 }, (_, i) => {
    const found = monthlyData.find((m) => m.month === i + 1);
    return Number(found?.total ?? 0);
  });

  return (
    <ReportClient
      monthlyData={monthArr}
      currentYear={currentYear}
      currentMonth={now.getMonth()}
      totalPengeluaran={Number(totalAllTime?.total ?? 0)}
      totalPOSelesai={monthStats?.c ?? 0}
      avgLeadTime={Math.round(Number(avgLead?.avg ?? 0))}
      topBahan={topBahan.map((b) => ({ namaBahan: b.namaBahan ?? "—", total: Number(b.total ?? 0) }))}
      vendorPerf={vendorPerf.map((v) => ({
        namaVendor: v.namaVendor ?? "—",
        estimasiPengiriman: v.estimasiPengiriman ?? 1,
        poCount: v.poCount,
      }))}
    />
  );
}
