export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { outlets, masterMenu, masterBahan } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { StoresClient } from "./stores-client";

export default async function StoresPage() {
  const outletList = await db.select().from(outlets);
  const [menuCount] = await db.select({ c: count() }).from(masterMenu);
  const [bahanCount] = await db.select({ c: count() }).from(masterBahan);

  // Menu with totalCogs and hargaJual per outlet
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

  return (
    <StoresClient
      outlets={outletList}
      menuList={menuList}
      totalMenuCount={menuCount.c}
      totalBahanCount={bahanCount.c}
    />
  );
}
