import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { masterBahan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { getStockStatus, estimateDaysUntilStockout } from "@/lib/utils";
import type { StockStatus } from "@/lib/utils";

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
  vendor: string;
  actionPO: string;
  satuanDapur: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

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

    const results: ParsedItem[] = [];

    for (const row of rows) {
      const namaBahan = String(row["nama_bahan"] || row["Nama Bahan"] || row["product_name"] || "");
      const stokAkhir = parseFloat(String(row["stok_akhir"] || row["Stok Akhir"] || row["stock"] || 0));

      if (!namaBahan) continue;

      // Try to find matching bahan in database
      const allBahan = await db.select().from(masterBahan);
      const match = allBahan.find(
        (b) => b.namaBahan.toLowerCase() === namaBahan.toLowerCase()
      );

      const stokMinimum = match?.stokMinimum ?? 5;
      const leadTimeDays = match?.leadTimeDays ?? 1;
      const avgDailyConsumption = match?.avgDailyConsumption ?? 0;
      const satuanDapur = match?.satuanDapur ?? "pcs";

      const status = getStockStatus(stokAkhir, stokMinimum, leadTimeDays, avgDailyConsumption);
      const daysUntilStockout = estimateDaysUntilStockout(stokAkhir, avgDailyConsumption);

      // Update stok_saat_ini in database if match found
      if (match) {
        await db
          .update(masterBahan)
          .set({ stokSaatIni: stokAkhir })
          .where(eq(masterBahan.id, match.id));
      }

      results.push({
        id: match?.id || "-",
        namaBahan,
        stokAkhir,
        stokMinimum,
        leadTimeDays,
        avgDailyConsumption,
        status,
        statusEmoji: status === "SAFE" ? "🟢" : status === "WARNING" ? "🟠" : "🔴",
        daysUntilStockout,
        vendor: "-",
        actionPO: status === "SAFE" ? "Safe" : "Order Sekarang",
        satuanDapur,
      });
    }

    return NextResponse.json({
      message: `Berhasil memproses ${results.length} item dari Excel.`,
      data: results,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Gagal memproses file: ${message}` }, { status: 500 });
  }
}
