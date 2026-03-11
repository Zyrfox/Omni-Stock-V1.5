export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import {
  masterBahan, masterMenu, mappingResep, outlets, semiFinished
} from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const [bahanCount] = await db.select({ c: count() }).from(masterBahan);
  const [menuCount] = await db.select({ c: count() }).from(masterMenu);
  // BOM count = distinct parentId in mappingResep
  const [bomCount] = await db
    .select({ c: sql<number>`count(distinct ${mappingResep.parentId})` })
    .from(mappingResep);

  const bahanList = await db
    .select({
      id: masterBahan.id,
      namaBahan: masterBahan.namaBahan,
      tipeBahan: masterBahan.tipeBahan,
      kategoriBahan: masterBahan.kategoriBahan,
      satuanBeli: masterBahan.satuanBeli,
      satuanDapur: masterBahan.satuanDapur,
      stokMinimum: masterBahan.stokMinimum,
      hargaBeli: masterBahan.hargaBeli,
      isiSatuan: masterBahan.isiSatuan,
      hargaPerSatuanPorsi: masterBahan.hargaPerSatuanPorsi,
      outletId: masterBahan.outletId,
    })
    .from(masterBahan);

  const menuList = await db
    .select({
      id: masterMenu.id,
      namaMenu: masterMenu.namaMenu,
      outletId: masterMenu.outletId,
      kategori: masterMenu.kategori,
      hargaJual: masterMenu.hargaJual,
      totalCogs: masterMenu.totalCogs,
    })
    .from(masterMenu);

  // Recipes with ingredient counts
  const recipesRaw = await db
    .select({
      parentId: mappingResep.parentId,
      parentType: mappingResep.parentType,
      itemId: mappingResep.itemId,
      itemType: mappingResep.itemType,
      qty: mappingResep.qty,
    })
    .from(mappingResep);

  const outletList = await db.select().from(outlets);
  const semiFinishedList = await db.select().from(semiFinished);

  return (
    <ProductsClient
      bahanCount={bahanCount.c}
      menuCount={menuCount.c}
      bomCount={Number(bomCount.c)}
      bahanList={bahanList}
      menuList={menuList}
      recipes={recipesRaw}
      outlets={outletList}
      semiFinishedList={semiFinishedList}
    />
  );
}
