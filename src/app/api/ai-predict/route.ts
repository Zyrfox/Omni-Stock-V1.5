import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/lib/db";
import { masterBahan, mappingResep, masterMenu } from "@/lib/db/schema";
import { getStockStatus, estimateDaysUntilStockout } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth";

function buildPackagedPrompt(item: AnalysisItem): string {
  return `Kamu adalah AI Konsultan Inventory F&B. Bahan ini bertipe PACKAGED.
Stok saat ini ${item.stokSaatIni} ${item.satuan}, konsumsi ${item.avgDailyConsumption} ${item.satuan}/hari, lead time ${item.leadTimeDays} hari, stok minimum ${item.stokMinimum} ${item.satuan}.
Estimasi habis dalam ${item.estimasiHariHabis ?? "N/A"} hari.
Berikan rekomendasi singkat dalam Bahasa Indonesia: apakah perlu order sekarang, berapa qty yang disarankan (buffer 5 hari), dan estimasi kapan tiba.`;
}

function buildRawBulkPrompt(item: AnalysisItem, relatedMenus: string[]): string {
  return `Kamu adalah AI Konsultan Inventory F&B. Bahan ini bertipe RAW/BULK.
Stok saat ini ${item.stokSaatIni} ${item.satuan}, konsumsi ${item.avgDailyConsumption} ${item.satuan}/hari, lead time ${item.leadTimeDays} hari, stok minimum ${item.stokMinimum} ${item.satuan}.
Estimasi habis dalam ${item.estimasiHariHabis ?? "N/A"} hari.
Bahan ini digunakan untuk menu: ${relatedMenus.join(", ") || "tidak diketahui"}.
Berikan rekomendasi dalam Bahasa Indonesia:
1. Apakah perlu order sekarang, berapa qty (buffer 5 hari)
2. Riset estimasi harga pasar terkini per kg untuk bahan "${item.nama}" di Indonesia
3. Estimasi yield: qty yang disarankan mencukupi berapa porsi menu terkait`;
}

interface AnalysisItem {
  id: string;
  nama: string;
  tipeBahan: string;
  stokSaatIni: number;
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
      stokSaatIni: m.stokSaatIni,
      stokMinimum: m.stokMinimum,
      satuan: m.satuanDapur,
      leadTimeDays: m.leadTimeDays,
      avgDailyConsumption: m.avgDailyConsumption,
      status: getStockStatus(m.stokSaatIni, m.stokMinimum, m.leadTimeDays, m.avgDailyConsumption),
      estimasiHariHabis: estimateDaysUntilStockout(m.stokSaatIni, m.avgDailyConsumption),
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
        // Rule-based fallback per item
        const daysLeft = item.estimasiHariHabis;
        const buffer5 = item.avgDailyConsumption * (item.leadTimeDays + 5);
        const qtyRec = Math.max(0, Math.ceil(buffer5 - item.stokSaatIni));
        aiText = item.status === "CRITICAL"
          ? `Stok ${item.nama} ${item.stokSaatIni}${item.satuan} sudah di bawah minimum (${item.stokMinimum}). BUAT PO SEKARANG. Order ${qtyRec} ${item.satuan}.`
          : item.status === "WARNING"
          ? `Stok ${item.nama} ${item.stokSaatIni}${item.satuan}. Habis dalam ${daysLeft} hari. Order sekarang ${qtyRec} ${item.satuan}.`
          : `Stok ${item.nama} aman (${item.stokSaatIni}${item.satuan}).`;
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
