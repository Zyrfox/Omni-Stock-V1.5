export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { purchaseOrders, masterVendor, masterBahan, outlets, users } from "@/lib/db/schema";
import { count, eq, sql, desc } from "drizzle-orm";
import { POLogsClient } from "./po-logs-client";

export default async function POLogsPage() {
  const [totalPO] = await db.select({ c: count() }).from(purchaseOrders);
  const [draftCount] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "draft"));
  const [sentCount] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "sent"));
  const [receivedCount] = await db.select({ c: count() }).from(purchaseOrders).where(eq(purchaseOrders.status, "received"));

  const poList = await db
    .select({
      id: purchaseOrders.id,
      status: purchaseOrders.status,
      qtyOrder: purchaseOrders.qtyOrder,
      hargaSatuan: purchaseOrders.hargaSatuan,
      totalHarga: purchaseOrders.totalHarga,
      aiNotes: purchaseOrders.aiNotes,
      tanggalKirim: purchaseOrders.tanggalKirim,
      tanggalTerima: purchaseOrders.tanggalTerima,
      createdAt: purchaseOrders.createdAt,
      createdBy: purchaseOrders.createdBy,
      outletId: purchaseOrders.outletId,
      namaVendor: masterVendor.namaVendor,
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
    <POLogsClient
      totalPO={totalPO.c}
      draftCount={draftCount.c}
      sentCount={sentCount.c}
      receivedCount={receivedCount.c}
      poList={poList.map((po) => ({
        ...po,
        createdAt: po.createdAt.toISOString(),
        tanggalKirim: po.tanggalKirim?.toISOString() ?? null,
        tanggalTerima: po.tanggalTerima?.toISOString() ?? null,
        namaVendor: po.namaVendor ?? "—",
        namaBahan: po.namaBahan ?? "—",
        satuanBeli: po.satuanBeli ?? "—",
        namaOutlet: po.namaOutlet ?? po.outletId,
      }))}
    />
  );
}
