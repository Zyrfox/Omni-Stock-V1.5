import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { masterMenu } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { generateCustomId } from "@/lib/utils";

// POST — create new menu
export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { namaMenu, outletId, kategori, hargaJual } = body as {
      namaMenu: string;
      outletId: string;
      kategori?: "food" | "beverage";
      hargaJual?: number;
    };

    if (!namaMenu || !outletId) {
      return NextResponse.json({ error: "Nama menu dan outlet wajib diisi" }, { status: 400 });
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(masterMenu);
    const id = generateCustomId("MNU", Number(count) + 1);

    const [newMenu] = await db.insert(masterMenu).values({
      id,
      namaMenu,
      outletId,
      kategori: kategori || null,
      hargaJual: Number(hargaJual) || 0,
      totalCogs: 0,
    }).returning();

    return NextResponse.json({ message: "Menu berhasil ditambahkan", data: newMenu });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
