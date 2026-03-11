import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchaseOrders, masterVendor } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { generateCustomId } from "@/lib/utils";

// GET — list all POs
export async function GET(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pos = await db.select().from(purchaseOrders);
    return NextResponse.json({ data: pos });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST — create draft PO
export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { outletId, vendorId, bahanId, qtyOrder, hargaSatuan, aiNotes } = body as {
      outletId: string;
      vendorId: string;
      bahanId: string;
      qtyOrder: number;
      hargaSatuan: number;
      aiNotes?: string;
    };

    if (!outletId || !vendorId || !bahanId || !qtyOrder) {
      return NextResponse.json({ error: "Field wajib: outletId, vendorId, bahanId, qtyOrder" }, { status: 400 });
    }

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrders);
    const id = generateCustomId("PO", Number(count) + 1);

    await db.insert(purchaseOrders).values({
      id,
      outletId,
      vendorId,
      bahanId,
      status: "draft",
      qtyOrder,
      hargaSatuan: hargaSatuan || 0,
      totalHarga: qtyOrder * (hargaSatuan || 0),
      aiNotes: aiNotes || null,
      createdBy: appUser.id,
    });

    return NextResponse.json({ message: "Draft PO berhasil dibuat", id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH — update PO status (draft → sent → received)
export async function PATCH(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, action, qtyOrder, hargaSatuan } = body as {
      id: string;
      action: "send" | "receive" | "update_draft";
      qtyOrder?: number;
      hargaSatuan?: number;
    };

    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    if (!po) return NextResponse.json({ error: "PO tidak ditemukan" }, { status: 404 });

    if (action === "update_draft") {
      if (po.status !== "draft") {
        return NextResponse.json({ error: "Hanya draft PO yang bisa diedit" }, { status: 400 });
      }
      const qty = qtyOrder ?? po.qtyOrder;
      const harga = hargaSatuan ?? po.hargaSatuan;
      await db.update(purchaseOrders).set({
        qtyOrder: qty,
        hargaSatuan: harga,
        totalHarga: qty * harga,
      }).where(eq(purchaseOrders.id, id));
      return NextResponse.json({ message: "Draft PO diupdate" });
    }

    if (action === "send") {
      if (po.status !== "draft") {
        return NextResponse.json({ error: "Hanya draft PO yang bisa dikirim" }, { status: 400 });
      }
      await db.update(purchaseOrders).set({
        status: "sent",
        tanggalKirim: new Date(),
      }).where(eq(purchaseOrders.id, id));
      return NextResponse.json({ message: "PO berhasil dikirim" });
    }

    if (action === "receive") {
      if (po.status !== "sent") {
        return NextResponse.json({ error: "Hanya PO yang sudah dikirim yang bisa diterima" }, { status: 400 });
      }
      await db.update(purchaseOrders).set({
        status: "received",
        tanggalTerima: new Date(),
      }).where(eq(purchaseOrders.id, id));

      // Note: stock is transient (no stok_saat_ini in DB) — tracked via Pawoon upload sessions
      return NextResponse.json({ message: "PO diterima dan dicatat" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
