export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { purchaseOrders, masterVendor, masterBahan, outlets } from "@/lib/db/schema";
import { count, eq, sql, desc } from "drizzle-orm";
import { DeliveryClient } from "./delivery-client";

export default async function DeliveryPage() {
  const [inTransit] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "sent"));
  const [pending] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "draft"));
  const [delivered] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "received"));

  const deliveries = await db
    .select({
      id: purchaseOrders.id,
      status: purchaseOrders.status,
      qtyOrder: purchaseOrders.qtyOrder,
      totalHarga: purchaseOrders.totalHarga,
      tanggalKirim: purchaseOrders.tanggalKirim,
      tanggalTerima: purchaseOrders.tanggalTerima,
      createdAt: purchaseOrders.createdAt,
      namaVendor: masterVendor.namaVendor,
      estimasiPengiriman: masterVendor.estimasiPengiriman,
      namaBahan: masterBahan.namaBahan,
      satuanBeli: masterBahan.satuanBeli,
      namaOutlet: outlets.namaOutlet,
    })
    .from(purchaseOrders)
    .leftJoin(masterVendor, eq(purchaseOrders.vendorId, masterVendor.id))
    .leftJoin(masterBahan, eq(purchaseOrders.bahanId, masterBahan.id))
    .leftJoin(outlets, eq(purchaseOrders.outletId, outlets.id))
    .orderBy(desc(purchaseOrders.createdAt));

  return (
    <DeliveryClient
      inTransit={inTransit.c}
      pending={pending.c}
      delivered={delivered.c}
      deliveries={deliveries.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        tanggalKirim: d.tanggalKirim?.toISOString() ?? null,
        tanggalTerima: d.tanggalTerima?.toISOString() ?? null,
        namaVendor: d.namaVendor ?? "—",
        namaBahan: d.namaBahan ?? "—",
        satuanBeli: d.satuanBeli ?? "—",
        namaOutlet: d.namaOutlet ?? "—",
        estimasiPengiriman: d.estimasiPengiriman ?? 1,
      }))}
    />
  );
}
