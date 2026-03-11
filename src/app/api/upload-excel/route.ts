import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { masterBahan, masterMenu, mappingResep, salesTransactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import { getStockStatus, estimateDaysUntilStockout, generateCustomId } from "@/lib/utils";
import type { StockStatus } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";

interface ParsedItem {
  id: string;
  namaBahan: string;
  stokAkhir: number;
  stokMinimum: number;
  leadTimeDays: number;
  avgDailyConsumption: number;
  status: StockStatus;
  statusEmoji: string;
  daysUntilStockout: number | null;
  actionPO: string;
  satuanDapur: string;
  tipeBahan: string;
}

export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const outletId = (formData.get("outlet_id") as string) || "OUT-001";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return NextResponse.json({ error: "File Excel kosong" }, { status: 400 });
    }

    // Generate batch ID
    const uploadBatchId = `BATCH-${Date.now()}`;
    const allBahan = await db.select().from(masterBahan);
    const allMenu = await db.select().from(masterMenu);
    const allResep = await db.select().from(mappingResep);

    // Count existing transactions for ID generation
    const [{ count: trxCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesTransactions);
    let trxSeq = Number(trxCount) + 1;

    const results: ParsedItem[] = [];
    const consumptionMap = new Map<string, number>();
    const uniqueDates = new Set<string>();

    for (const row of rows) {
      const menuName = String(row["nama_menu"] || row["Nama Menu"] || row["product_name"] || "");
      const qtyTerjual = parseInt(String(row["qty"] || row["Qty"] || row["quantity"] || 0));
      const tanggal = String(row["tanggal"] || row["Tanggal"] || row["date"] || new Date().toISOString().split("T")[0]);

      if (!menuName || qtyTerjual <= 0) continue;
      uniqueDates.add(tanggal);

      // Match menu
      const menu = allMenu.find((m) => m.namaMenu.toLowerCase() === menuName.toLowerCase());
      if (!menu) continue;

      // Insert sales_transaction
      await db.insert(salesTransactions).values({
        id: generateCustomId("TRX", trxSeq++),
        outletId,
        uploadBatchId,
        tanggalTransaksi: tanggal,
        menuId: menu.id,
        qtyTerjual,
      });

      // Calculate bahan consumption via mapping_resep
      const recipes = allResep.filter((r) => r.parentId === menu.id && r.parentType === "menu");
      for (const recipe of recipes) {
        if (recipe.itemType === "bahan_dasar") {
          const curr = consumptionMap.get(recipe.itemId) || 0;
          consumptionMap.set(recipe.itemId, curr + recipe.qty * qtyTerjual);
        } else if (recipe.itemType === "semi_finished") {
          // Resolve 2nd level: semi_finished → bahan_dasar
          const subRecipes = allResep.filter((r) => r.parentId === recipe.itemId && r.parentType === "semi_finished");
          for (const sub of subRecipes) {
            if (sub.itemType === "bahan_dasar") {
              const curr = consumptionMap.get(sub.itemId) || 0;
              consumptionMap.set(sub.itemId, curr + sub.qty * recipe.qty * qtyTerjual);
            }
          }
        }
      }
    }

    // Update avg_daily_consumption (auto mode only) — stok is transient, NOT stored in DB
    const numDays = Math.max(1, uniqueDates.size);
    for (const [bahanId, totalUsed] of consumptionMap.entries()) {
      const bahan = allBahan.find((b) => b.id === bahanId);
      if (!bahan) continue;

      // Skip manual source — user set it intentionally, don't override
      if (bahan.avgConsumptionSource === "manual") continue;

      // Daily consumption from this upload period
      const uploadDailyAvg = totalUsed / numDays;

      // Exponential moving average: weight new data at 30%, keep history at 70%
      const prevAvg = bahan.avgDailyConsumption || uploadDailyAvg;
      const newAvg = parseFloat((prevAvg * 0.7 + uploadDailyAvg * 0.3).toFixed(4));

      await db
        .update(masterBahan)
        .set({
          avgDailyConsumption: newAvg,
          avgConsumptionSource: "auto",
        })
        .where(eq(masterBahan.id, bahanId));
    }

    // Build results for response
    const updatedBahan = await db.select().from(masterBahan);
    // Stock is transient — derive consumed stock from consumptionMap for this upload session only
    for (const bahan of updatedBahan) {
      const consumed = consumptionMap.get(bahan.id) ?? 0;
      // stokAkhir in response represents net consumption this session (not persistent DB stock)
      const status = getStockStatus(0, bahan.stokMinimum, bahan.leadTimeDays, bahan.avgDailyConsumption);
      const daysUntilStockout = estimateDaysUntilStockout(0, bahan.avgDailyConsumption);
      results.push({
        id: bahan.id,
        namaBahan: bahan.namaBahan,
        stokAkhir: consumed,
        stokMinimum: bahan.stokMinimum,
        leadTimeDays: bahan.leadTimeDays,
        avgDailyConsumption: bahan.avgDailyConsumption,
        status,
        statusEmoji: status === "SAFE" ? "🟢" : status === "WARNING" ? "🟠" : "🔴",
        daysUntilStockout,
        actionPO: status === "SAFE" ? "Safe" : "Order Sekarang",
        satuanDapur: bahan.satuanDapur,
        tipeBahan: bahan.tipeBahan,
      });
    }

    return NextResponse.json({
      message: `Berhasil: ${trxSeq - Number(trxCount) - 1} transaksi diproses, ${consumptionMap.size} bahan baku terupdate.`,
      batchId: uploadBatchId,
      data: results,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Gagal memproses file: ${message}` }, { status: 500 });
  }
}
