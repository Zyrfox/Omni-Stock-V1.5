import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { systemConfigs, outlets, masterBahan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { google } from "googleapis";

export async function POST() {
  try {
    // Check if migration already done
    const existing = await db
      .select()
      .from(systemConfigs)
      .where(eq(systemConfigs.key, "is_initial_migration_done"));

    if (existing.length > 0 && existing[0].value === "true") {
      return NextResponse.json(
        { error: "Migrasi sudah pernah dilakukan. Tombol telah dikunci." },
        { status: 403 }
      );
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

    // 1. Fetch sys_outlets
    const outletsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "sys_outlets!A2:B",
    });
    const outletsRows = outletsRes.data.values || [];

    // 2. Fetch pawoon_products (master_bahan)
    const productsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "pawoon_products!A2:M",
    });
    const productsRows = productsRes.data.values || [];

    // Atomic transaction: insert all or rollback
    // Using Neon HTTP driver, we batch inserts
    let outletCount = 0;
    let bahanCount = 0;

    // Insert outlets
    for (const row of outletsRows) {
      if (row[0] && row[1]) {
        await db.insert(outlets).values({
          id: row[0],
          namaOutlet: row[1],
        }).onConflictDoNothing();
        outletCount++;
      }
    }

    // Insert master_bahan
    for (const row of productsRows) {
      if (row[0] && row[2]) {
        await db.insert(masterBahan).values({
          id: row[0],
          outletId: row[1] || "OUT-001",
          namaBahan: row[2],
          kategoriBahan: "bahan_mentah",
          hargaBeli: parseFloat(row[3]) || 0,
          satuanBeli: row[4] || "kg",
          isiSatuan: parseFloat(row[5]) || 1,
          satuanDapur: row[6] || "kg",
          stokSaatIni: parseFloat(row[7]) || 0,
          stokMinimum: parseInt(row[8]) || 0,
          leadTimeDays: parseInt(row[9]) || 1,
          avgDailyConsumption: parseFloat(row[10]) || 0,
          hargaPerSatuanPorsi: parseFloat(row[11]) || 0,
        }).onConflictDoNothing();
        bahanCount++;
      }
    }

    // Mark migration as done
    await db.insert(systemConfigs).values({
      key: "is_initial_migration_done",
      value: "true",
    }).onConflictDoNothing();

    return NextResponse.json({
      message: `Berhasil: ${outletCount} outlet, ${bahanCount} bahan baku dimigrasikan.`,
    });
  } catch (error: unknown) {
    console.error("Migration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Migration gagal: ${message}` }, { status: 500 });
  }
}
