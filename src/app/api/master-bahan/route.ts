import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { masterBahan } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { generateCustomId } from "@/lib/utils";

// POST — create new bahan
export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (appUser.role !== "admin" && appUser.role !== "manager") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const {
      namaBahan,
      tipeBahan,
      kategoriBahan,
      hargaBeli,
      satuanBeli,
      isiSatuan,
      satuanDapur,
      stokMinimum,
      leadTimeDays,
      avgDailyConsumption,
      hargaPerSatuanPorsi,
      outletId,
    } = body as {
      namaBahan: string;
      tipeBahan: "packaged" | "raw_bulk";
      kategoriBahan?: "bahan_mentah" | "bumbu" | "kemasan" | "addon" | "lainnya";
      hargaBeli: number;
      satuanBeli: string;
      isiSatuan: number;
      satuanDapur: string;
      stokMinimum: number;
      leadTimeDays: number;
      avgDailyConsumption?: number;
      hargaPerSatuanPorsi?: number;
      outletId: string;
    };

    if (!namaBahan || !outletId) {
      return NextResponse.json({ error: "Nama bahan dan outlet wajib diisi" }, { status: 400 });
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(masterBahan);
    const id = generateCustomId("BHN", Number(count) + 1);

    // Calculate harga_per_satuan_porsi if not provided: hargaBeli / isiSatuan
    const computedHargaPerSatuanPorsi =
      hargaPerSatuanPorsi !== undefined
        ? hargaPerSatuanPorsi
        : isiSatuan > 0
          ? hargaBeli / isiSatuan
          : 0;

    const [newBahan] = await db.insert(masterBahan).values({
      id,
      outletId,
      namaBahan,
      tipeBahan: tipeBahan || "packaged",
      kategoriBahan: kategoriBahan || "bahan_mentah",
      hargaBeli: Number(hargaBeli) || 0,
      satuanBeli: satuanBeli || "kg",
      isiSatuan: Number(isiSatuan) || 1,
      satuanDapur: satuanDapur || "gram",
      stokMinimum: Number(stokMinimum) || 0,
      leadTimeDays: Number(leadTimeDays) || 1,
      avgDailyConsumption: Number(avgDailyConsumption) || 0,
      avgConsumptionSource: "manual",
      hargaPerSatuanPorsi: computedHargaPerSatuanPorsi,
    }).returning();

    return NextResponse.json({ message: "Bahan berhasil ditambahkan", data: newBahan });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — update bahan
export async function PATCH(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...rest } = body as {
      id: string;
      namaBahan?: string;
      tipeBahan?: "packaged" | "raw_bulk";
      kategoriBahan?: "bahan_mentah" | "bumbu" | "kemasan" | "addon" | "lainnya";
      hargaBeli?: number;
      satuanBeli?: string;
      isiSatuan?: number;
      satuanDapur?: string;
      stokMinimum?: number;
      leadTimeDays?: number;
      avgDailyConsumption?: number;
      hargaPerSatuanPorsi?: number;
    };

    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    const existing = await db.select().from(masterBahan).where(eq(masterBahan.id, id));
    if (existing.length === 0) return NextResponse.json({ error: "Bahan tidak ditemukan" }, { status: 404 });

    // Recalculate hargaPerSatuanPorsi if hargaBeli or isiSatuan changed
    const updateData: Record<string, unknown> = { ...rest };
    if ((rest.hargaBeli !== undefined || rest.isiSatuan !== undefined) && rest.hargaPerSatuanPorsi === undefined) {
      const b = existing[0];
      const hargaBeli = rest.hargaBeli !== undefined ? rest.hargaBeli : b.hargaBeli;
      const isiSatuan = rest.isiSatuan !== undefined ? rest.isiSatuan : b.isiSatuan;
      updateData.hargaPerSatuanPorsi = isiSatuan > 0 ? hargaBeli / isiSatuan : 0;
    }

    const [updated] = await db
      .update(masterBahan)
      .set(updateData as Partial<typeof masterBahan.$inferInsert>)
      .where(eq(masterBahan.id, id))
      .returning();

    return NextResponse.json({ message: "Bahan berhasil diupdate", data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
