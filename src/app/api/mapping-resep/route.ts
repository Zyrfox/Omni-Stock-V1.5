import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mappingResep, masterBahan, masterMenu } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { generateCustomId } from "@/lib/utils";

// POST — save BOM for a menu (replaces all existing rows for this menuId)
export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { menuId, items } = body as {
      menuId: string;
      items: { itemType: "bahan_dasar" | "semi_finished"; itemId: string; qty: number }[];
    };

    if (!menuId) return NextResponse.json({ error: "menuId wajib" }, { status: 400 });
    if (!Array.isArray(items)) return NextResponse.json({ error: "items harus array" }, { status: 400 });

    // Delete all existing RSP records for this menuId
    await db.delete(mappingResep).where(eq(mappingResep.parentId, menuId));

    // Insert new records
    const [{ count: rspCount }] = await db.select({ count: sql<number>`count(*)` }).from(mappingResep);
    let seq = Number(rspCount) + 1;

    const validItems = items.filter((it) => it.itemId && it.qty > 0);
    for (const item of validItems) {
      await db.insert(mappingResep).values({
        id: generateCustomId("RSP", seq++),
        parentId: menuId,
        parentType: "menu",
        itemId: item.itemId,
        itemType: item.itemType,
        qty: item.qty,
      });
    }

    // Recalculate total_cogs for this menu
    // For bahan_dasar: SUM(qty × harga_per_satuan_porsi)
    // For semi_finished: currently treated as 0 (2-level resolve requires separate query)
    const allBahan = await db.select().from(masterBahan);
    let totalCogs = 0;

    for (const item of validItems) {
      if (item.itemType === "bahan_dasar") {
        const bahan = allBahan.find((b) => b.id === item.itemId);
        if (bahan) {
          totalCogs += item.qty * bahan.hargaPerSatuanPorsi;
        }
      }
      // semi_finished: recursively resolve sub-items
      if (item.itemType === "semi_finished") {
        const subRecipes = await db
          .select()
          .from(mappingResep)
          .where(eq(mappingResep.parentId, item.itemId));

        for (const sub of subRecipes) {
          if (sub.itemType === "bahan_dasar") {
            const subBahan = allBahan.find((b) => b.id === sub.itemId);
            if (subBahan) {
              totalCogs += item.qty * sub.qty * subBahan.hargaPerSatuanPorsi;
            }
          }
        }
      }
    }

    // Update master_menu.total_cogs
    await db.update(masterMenu).set({ totalCogs }).where(eq(masterMenu.id, menuId));

    return NextResponse.json({
      message: `BOM berhasil disimpan: ${validItems.length} item, COGS = ${totalCogs}`,
      totalCogs,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
