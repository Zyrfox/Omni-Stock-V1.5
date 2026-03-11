export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { masterVendor, vendorBahan, purchaseOrders } from "@/lib/db/schema";
import { count, eq, sum, isNotNull, sql, desc } from "drizzle-orm";
import { SuppliersClient } from "./suppliers-client";

export default async function SuppliersPage() {
  const vendorList = await db.select().from(masterVendor);
  const [vendorCount] = await db.select({ c: count() }).from(masterVendor);
  const [bahanCount] = await db
    .select({ c: sql<number>`count(distinct ${vendorBahan.bahanId})` })
    .from(vendorBahan);
  const [waCount] = await db
    .select({ c: count() })
    .from(masterVendor)
    .where(isNotNull(masterVendor.kontakWa));

  // Per-vendor stats: item count + total pengeluaran
  const vendorStats = await db
    .select({
      vendorId: vendorBahan.vendorId,
      itemCount: count(vendorBahan.id),
    })
    .from(vendorBahan)
    .groupBy(vendorBahan.vendorId);

  const vendorSpend = await db
    .select({
      vendorId: purchaseOrders.vendorId,
      totalSpend: sum(purchaseOrders.totalHarga),
    })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.status, "received"))
    .groupBy(purchaseOrders.vendorId);

  // PO history per vendor
  const poHistory = await db
    .select({
      id: purchaseOrders.id,
      vendorId: purchaseOrders.vendorId,
      status: purchaseOrders.status,
      totalHarga: purchaseOrders.totalHarga,
      createdAt: purchaseOrders.createdAt,
    })
    .from(purchaseOrders)
    .orderBy(desc(purchaseOrders.createdAt))
    .limit(50);

  const statsMap = Object.fromEntries(vendorStats.map((v) => [v.vendorId, v.itemCount]));
  const spendMap = Object.fromEntries(vendorSpend.map((v) => [v.vendorId, Number(v.totalSpend ?? 0)]));

  return (
    <SuppliersClient
      vendors={vendorList}
      vendorCount={vendorCount.c}
      distinctBahanCount={Number(bahanCount.c)}
      waCount={waCount.c}
      statsMap={statsMap}
      spendMap={spendMap}
      poHistory={poHistory.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
    />
  );
}
