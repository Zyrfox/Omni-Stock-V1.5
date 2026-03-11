import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { masterVendor } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { generateCustomId } from "@/lib/utils";

// POST — create new vendor
export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (appUser.role !== "admin" && appUser.role !== "manager") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { namaVendor, noRekening, kontakWa, estimasiPengiriman } = body as {
      namaVendor: string;
      noRekening?: string;
      kontakWa?: string;
      estimasiPengiriman: number;
    };

    if (!namaVendor || !estimasiPengiriman) {
      return NextResponse.json({ error: "Nama vendor dan estimasi pengiriman wajib diisi" }, { status: 400 });
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(masterVendor);
    const id = generateCustomId("VND", Number(count) + 1);

    const [newVendor] = await db.insert(masterVendor).values({
      id,
      namaVendor,
      noRekening: noRekening || null,
      kontakWa: kontakWa || null,
      estimasiPengiriman: Number(estimasiPengiriman),
    }).returning();

    return NextResponse.json({ message: "Vendor berhasil ditambahkan", data: newVendor });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — update vendor
export async function PATCH(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, namaVendor, noRekening, kontakWa, estimasiPengiriman } = body as {
      id: string;
      namaVendor?: string;
      noRekening?: string;
      kontakWa?: string;
      estimasiPengiriman?: number;
    };

    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    const existing = await db.select().from(masterVendor).where(eq(masterVendor.id, id));
    if (existing.length === 0) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });

    const updateData: Partial<typeof masterVendor.$inferInsert> = {};
    if (namaVendor !== undefined) updateData.namaVendor = namaVendor;
    if (noRekening !== undefined) updateData.noRekening = noRekening;
    if (kontakWa !== undefined) updateData.kontakWa = kontakWa;
    if (estimasiPengiriman !== undefined) updateData.estimasiPengiriman = Number(estimasiPengiriman);

    const [updated] = await db.update(masterVendor).set(updateData).where(eq(masterVendor.id, id)).returning();
    return NextResponse.json({ message: "Vendor berhasil diupdate", data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
