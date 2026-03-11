import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/lib/db";
import { masterBahan, mappingResep, masterMenu } from "@/lib/db/schema";
import { getStockStatus, estimateDaysUntilStockout } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";

function buildPackagedPrompt(item: AnalysisItem): string {
  return `Kamu adalah AI Konsultan Inventory F&B. Bahan ini bertipe PACKAGED.
Konsumsi rata-rata ${item.avgDailyConsumption} ${item.satuan}/hari, lead time ${item.leadTimeDays} hari, stok minimum ${item.stokMinimum} ${item.satuan}.
Catatan: data stok aktual tidak tersedia (bersifat transient dari upload Pawoon).
Berikan rekomendasi singkat dalam Bahasa Indonesia: berapa qty yang disarankan di-order (buffer 5 hari) berdasarkan konsumsi harian.`;
}

function buildRawBulkPrompt(item: AnalysisItem, relatedMenus: string[]): string {
  return `Kamu adalah AI Konsultan Inventory F&B. Bahan ini bertipe RAW/BULK.
Konsumsi rata-rata ${item.avgDailyConsumption} ${item.satuan}/hari, lead time ${item.leadTimeDays} hari, stok minimum ${item.stokMinimum} ${item.satuan}.
Catatan: data stok aktual tidak tersedia (bersifat transient dari upload Pawoon).
Bahan ini digunakan untuk menu: ${relatedMenus.join(", ") || "tidak diketahui"}.
Berikan rekomendasi dalam Bahasa Indonesia:
1. Berapa qty yang disarankan di-order (buffer 5 hari berdasarkan konsumsi)
2. Riset estimasi harga pasar terkini per kg untuk bahan "${item.nama}" di Indonesia
3. Estimasi yield: qty yang disarankan mencukupi berapa porsi menu terkait`;
}

interface AnalysisItem {
  id: string;
  nama: string;
  tipeBahan: string;
  stokMinimum: number;
  satuan: string;
  leadTimeDays: number;
  avgDailyConsumption: number;
  status: string;
  estimasiHariHabis: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const appUser = await getSessionUser(request.headers);
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bahanIds } = body as { bahanIds?: string[] };

    let materials = await db.select().from(masterBahan);
    if (bahanIds && bahanIds.length > 0) {
      materials = materials.filter((m) => bahanIds.includes(m.id));
    }

    if (materials.length === 0) {
      return NextResponse.json({ error: "Tidak ada data bahan baku" }, { status: 400 });
    }

    const allResep = await db.select().from(mappingResep);
    const allMenu = await db.select().from(masterMenu);

    const analysisItems: AnalysisItem[] = materials.map((m) => ({
      id: m.id,
      nama: m.namaBahan,
      tipeBahan: m.tipeBahan,
      stokMinimum: m.stokMinimum,
      satuan: m.satuanDapur,
      leadTimeDays: m.leadTimeDays,
      avgDailyConsumption: m.avgDailyConsumption,
      // Stock is transient — no stok_saat_ini in DB. Use status WARNING as default to trigger recommendations.
      status: getStockStatus(0, m.stokMinimum, m.leadTimeDays, m.avgDailyConsumption),
      estimasiHariHabis: estimateDaysUntilStockout(0, m.avgDailyConsumption),
    }));

    // Generate AI recommendations per item
    const recommendations = [];
    for (const item of analysisItems) {
      let aiText = "";
      try {
        // Find related menus for raw_bulk
        const relatedMenuNames: string[] = [];
        if (item.tipeBahan === "raw_bulk") {
          const directRecipes = allResep.filter((r) => r.itemId === item.id && r.parentType === "menu");
          for (const r of directRecipes) {
            const menu = allMenu.find((m) => m.id === r.parentId);
            if (menu) relatedMenuNames.push(menu.namaMenu);
          }
        }

        const prompt = item.tipeBahan === "raw_bulk"
          ? buildRawBulkPrompt(item, relatedMenuNames)
          : buildPackagedPrompt(item);

        const result = await generateText({
          model: google("gemini-1.5-flash"),
          prompt,
          maxTokens: 500,
        });
        aiText = result.text;
      } catch {
        // Rule-based fallback per item (stok aktual tidak tersedia)
        const buffer5 = item.avgDailyConsumption * (item.leadTimeDays + 5);
        const qtyRec = Math.max(0, Math.ceil(buffer5));
        aiText = `Rekomendasi order ${item.nama}: ${qtyRec} ${item.satuan} (estimasi buffer ${item.leadTimeDays + 5} hari berdasarkan konsumsi ${item.avgDailyConsumption} ${item.satuan}/hari). Upload data Pawoon untuk analisis stok aktual.`;
      }

      recommendations.push({
        id: item.id,
        nama: item.nama,
        tipeBahan: item.tipeBahan,
        status: item.status,
        action: item.status === "SAFE" ? "Safe" : "Order Now",
        aiText,
      });
    }

    const criticalCount = analysisItems.filter((i) => i.status === "CRITICAL").length;
    const warningCount = analysisItems.filter((i) => i.status === "WARNING").length;

    return NextResponse.json({
      recommendations,
      summary: {
        total: analysisItems.length,
        critical: criticalCount,
        warning: warningCount,
        safe: analysisItems.length - criticalCount - warningCount,
      },
    });
  } catch (error: unknown) {
    console.error("AI Prediction error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `AI Analysis gagal: ${message}` }, { status: 500 });
  }
}
