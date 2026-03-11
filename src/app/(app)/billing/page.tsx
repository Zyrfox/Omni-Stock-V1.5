export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { purchaseOrders, masterVendor, masterBahan, outlets } from "@/lib/db/schema";
import { count, eq, sum, sql, desc } from "drizzle-orm";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const [totalPO] = await db.select({ c: count() }).from(purchaseOrders);
  const [outstanding] = await db
    .select({ c: count(), total: sum(purchaseOrders.totalHarga) })
    .from(purchaseOrders)
    .where(sql`${purchaseOrders.status} <> 'received'`);
  const [lunas] = await db
    .select({ c: count(), total: sum(purchaseOrders.totalHarga) })
    .from(purchaseOrders)
    .where(eq(purchaseOrders.status, "received"));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [bulanIni] = await db
    .select({ total: sum(purchaseOrders.totalHarga) })
    .from(purchaseOrders)
    .where(sql`${purchaseOrders.createdAt} >= ${startOfMonth.toISOString()}`);

  const invoices = await db
    .select({
      id: purchaseOrders.id,
      status: purchaseOrders.status,
      totalHarga: purchaseOrders.totalHarga,
      qtyOrder: purchaseOrders.qtyOrder,
      createdAt: purchaseOrders.createdAt,
      namaVendor: masterVendor.namaVendor,
      namaBahan: masterBahan.namaBahan,
      outletId: purchaseOrders.outletId,
    })
    .from(purchaseOrders)
    .leftJoin(masterVendor, eq(purchaseOrders.vendorId, masterVendor.id))
    .leftJoin(masterBahan, eq(purchaseOrders.bahanId, masterBahan.id))
    .orderBy(desc(purchaseOrders.createdAt));

  return (
    <BillingClient
      totalPO={totalPO.c}
      outstandingCount={outstanding.c}
      outstandingTotal={Number(outstanding.total ?? 0)}
      lunasCount={lunas.c}
      lunasTotal={Number(lunas.total ?? 0)}
      bulanIniTotal={Number(bulanIni?.total ?? 0)}
      invoices={invoices.map((inv) => ({
        ...inv,
        createdAt: inv.createdAt.toISOString(),
        namaVendor: inv.namaVendor ?? "—",
        namaBahan: inv.namaBahan ?? "—",
      }))}
    />
  );
}
