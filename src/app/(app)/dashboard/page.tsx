export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { masterBahan, purchaseOrders, outlets, users, masterVendor } from "@/lib/db/schema";
import { count, eq, sum, desc } from "drizzle-orm";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const [bahanCount] = await db.select({ c: count() }).from(masterBahan);
  const [outletCount] = await db.select({ c: count() }).from(outlets);
  const [userCount] = await db.select({ c: count() }).from(users);

  const [poDraft] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "draft"));
  const [poSent] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "sent"));
  const [poReceived] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "received"));
  const [poTotal] = await db.select({ c: count() }).from(purchaseOrders);

  const [pengeluaranTotal] = await db
    .select({ total: sum(purchaseOrders.totalHarga) })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.status, "received"));

  const recentPOs = await db
    .select({
      id: purchaseOrders.id,
      status: purchaseOrders.status,
      qtyOrder: purchaseOrders.qtyOrder,
      totalHarga: purchaseOrders.totalHarga,
      createdAt: purchaseOrders.createdAt,
      namaVendor: masterVendor.namaVendor,
      namaBahan: masterBahan.namaBahan,
      satuanBeli: masterBahan.satuanBeli,
    })
    .from(purchaseOrders)
    .leftJoin(masterVendor, eq(purchaseOrders.vendorId, masterVendor.id))
    .leftJoin(masterBahan, eq(purchaseOrders.bahanId, masterBahan.id))
    .orderBy(desc(purchaseOrders.createdAt))
    .limit(10);

  const bahanList = await db
    .select({
      id: masterBahan.id,
      namaBahan: masterBahan.namaBahan,
      tipeBahan: masterBahan.tipeBahan,
      kategoriBahan: masterBahan.kategoriBahan,
      stokMinimum: masterBahan.stokMinimum,
      hargaBeli: masterBahan.hargaBeli,
      satuanBeli: masterBahan.satuanBeli,
      hargaPerSatuanPorsi: masterBahan.hargaPerSatuanPorsi,
      avgDailyConsumption: masterBahan.avgDailyConsumption,
      leadTimeDays: masterBahan.leadTimeDays,
      outletId: masterBahan.outletId,
    })
    .from(masterBahan)
    .limit(50);

  const stats = {
    totalBahan: bahanCount.c,
    totalOutlets: outletCount.c,
    totalUsers: userCount.c,
    poDraft: poDraft.c,
    poSent: poSent.c,
    poReceived: poReceived.c,
    poTotal: poTotal.c,
    pengeluaran: Number(pengeluaranTotal.total ?? 0),
  };

  return (
    <DashboardClient
      stats={stats}
      recentPOs={recentPOs.map((po) => ({
        ...po,
        createdAt: po.createdAt.toISOString(),
        namaVendor: po.namaVendor ?? "—",
        namaBahan: po.namaBahan ?? "—",
        satuanBeli: po.satuanBeli ?? "—",
      }))}
      bahanList={bahanList}
    />
  );
}
