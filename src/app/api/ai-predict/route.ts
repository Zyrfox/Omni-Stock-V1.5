import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/lib/db";
import { masterBahan } from "@/lib/db/schema";
import { getStockStatus, estimateDaysUntilStockout } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bahanIds } = body as { bahanIds?: string[] };

    // Get materials to analyze
    let materials;
    if (bahanIds && bahanIds.length > 0) {
      materials = await db.select().from(masterBahan);
      materials = materials.filter((m) => bahanIds.includes(m.id));
    } else {
      materials = await db.select().from(masterBahan);
    }

    if (materials.length === 0) {
      return NextResponse.json({ error: "Tidak ada data bahan baku" }, { status: 400 });
    }

    // Build analysis data
    const analysisItems = materials.map((m) => {
      const status = getStockStatus(m.stokSaatIni, m.stokMinimum, m.leadTimeDays, m.avgDailyConsumption);
      const daysLeft = estimateDaysUntilStockout(m.stokSaatIni, m.avgDailyConsumption);
      return {
        id: m.id,
        nama: m.namaBahan,
        stokSaatIni: m.stokSaatIni,
        stokMinimum: m.stokMinimum,
        satuan: m.satuanDapur,
        leadTimeDays: m.leadTimeDays,
        avgDailyConsumption: m.avgDailyConsumption,
        status,
        estimasiHariHabis: daysLeft,
      };
    });

    const criticalItems = analysisItems.filter((i) => i.status === "CRITICAL");
    const warningItems = analysisItems.filter((i) => i.status === "WARNING");

    const prompt = `Kamu adalah AI Konsultan Inventory untuk bisnis F&B. Analisis data bahan baku berikut dan berikan rekomendasi dalam Bahasa Indonesia yang ringkas dan actionable.

DATA BAHAN BAKU:
${JSON.stringify(analysisItems, null, 2)}

RINGKASAN:
- Total item: ${analysisItems.length}
- CRITICAL (🔴): ${criticalItems.length} item
- WARNING (🟠): ${warningItems.length} item
- SAFE (🟢): ${analysisItems.length - criticalItems.length - warningItems.length} item

Berikan analisis untuk SETIAP item dengan format:
1. Nama bahan - Status (emoji) - Rekomendasi singkat (1-2 kalimat)

Untuk item CRITICAL dan WARNING, jelaskan:
- Estimasi hari tersisa sebelum habis
- Apakah perlu membuat PO sekarang
- Jumlah yang sebaiknya dipesan (berdasarkan lead time × konsumsi harian × 1.5 safety factor)

Akhiri dengan RANGKUMAN TINDAKAN yang harus segera dilakukan.`;

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 2000,
    });

    // Build per-item recommendations
    const recommendations = analysisItems.map((item) => ({
      id: item.id,
      nama: item.nama,
      status: item.status,
      action: item.status === "SAFE" ? "Safe" : "Order Now",
      shortRec:
        item.status === "CRITICAL"
          ? `Stok ${item.nama} ${item.stokSaatIni}${item.satuan} sudah di bawah minimum (${item.stokMinimum}). BUAT PO SEKARANG.`
          : item.status === "WARNING"
          ? `Stok ${item.nama} ${item.stokSaatIni}${item.satuan}. Dengan pemakaian ${item.avgDailyConsumption}${item.satuan}/hari dan lead time ${item.leadTimeDays} hari, stok akan habis dalam ${item.estimasiHariHabis} hari. Segera buat PO.`
          : `Stok ${item.nama} aman (${item.stokSaatIni}${item.satuan}).`,
    }));

    return NextResponse.json({
      analysis: result.text,
      recommendations,
      summary: {
        total: analysisItems.length,
        critical: criticalItems.length,
        warning: warningItems.length,
        safe: analysisItems.length - criticalItems.length - warningItems.length,
      },
    });
  } catch (error: unknown) {
    console.error("AI Prediction error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    // Fallback: return rule-based recommendations without AI
    try {
      const materials = await db.select().from(masterBahan);
      const recommendations = materials.map((m) => {
        const status = getStockStatus(m.stokSaatIni, m.stokMinimum, m.leadTimeDays, m.avgDailyConsumption);
        const daysLeft = estimateDaysUntilStockout(m.stokSaatIni, m.avgDailyConsumption);
        return {
          id: m.id,
          nama: m.namaBahan,
          status,
          action: status === "SAFE" ? "Safe" : "Order Now",
          shortRec:
            status === "CRITICAL"
              ? `Stok ${m.namaBahan} ${m.stokSaatIni}${m.satuanDapur} sudah di bawah minimum (${m.stokMinimum}). BUAT PO SEKARANG.`
              : status === "WARNING"
              ? `Stok ${m.namaBahan} ${m.stokSaatIni}${m.satuanDapur}. Estimasi habis dalam ${daysLeft} hari. Segera buat PO.`
              : `Stok ${m.namaBahan} aman (${m.stokSaatIni}${m.satuanDapur}).`,
        };
      });

      return NextResponse.json({
        analysis: `[Fallback Mode - AI tidak tersedia: ${message}]\n\nRekomendasi berdasarkan rule-based analysis.`,
        recommendations,
        summary: {
          total: materials.length,
          critical: recommendations.filter((r) => r.status === "CRITICAL").length,
          warning: recommendations.filter((r) => r.status === "WARNING").length,
          safe: recommendations.filter((r) => r.status === "SAFE").length,
        },
      });
    } catch {
      return NextResponse.json({ error: `AI Analysis gagal: ${message}` }, { status: 500 });
    }
  }
}
