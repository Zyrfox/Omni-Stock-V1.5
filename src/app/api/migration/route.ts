import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { systemConfigs, outlets, masterBahan, mappingResep } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { google } from "googleapis";
import { getSessionUser, isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Auth check — admin only
    const appUser = await getSessionUser(request.headers);
    if (!appUser || !isAdmin(appUser)) {
      return NextResponse.json({ error: "Akses ditolak. Hanya admin." }, { status: 403 });
    }

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
    const gAuth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || "",
        private_key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth: gAuth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

    // 1. Fetch sys_outlets
    const outletsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: "sys_outlets!A2:B" });
    const outletsRows = outletsRes.data.values || [];

    // 2. Fetch pawoon_products (master_bahan)
    const productsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: "pawoon_products!A2:N" });
    const productsRows = productsRes.data.values || [];

    // 3. Fetch mapping_pawoon (mapping_resep)
    const mappingRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: "mapping_pawoon!A2:F" });
    const mappingRows = mappingRes.data.values || [];

    let outletCount = 0;
    let bahanCount = 0;
    let mappingCount = 0;

    // Insert outlets
    for (const row of outletsRows) {
      if (row[0] && row[1]) {
        await db.insert(outlets).values({ id: row[0], namaOutlet: row[1] }).onConflictDoNothing();
        outletCount++;
      }
    }

    // Insert master_bahan (with tipe_bahan column at index 12)
    for (const row of productsRows) {
      if (row[0] && row[2]) {
        const tipeBahan = (row[12] === "raw_bulk" ? "raw_bulk" : "packaged") as "packaged" | "raw_bulk";
        await db.insert(masterBahan).values({
          id: row[0],
          outletId: row[1] || "OUT-001",
          namaBahan: row[2],
          tipeBahan,
          kategoriBahan: "bahan_mentah",
          hargaBeli: parseFloat(row[3]) || 0,
          satuanBeli: row[4] || "kg",
          isiSatuan: parseFloat(row[5]) || 1,
          satuanDapur: row[6] || "kg",
          // row[7] was stok_saat_ini — now transient, skip
          stokMinimum: parseInt(row[8]) || 0,
          leadTimeDays: parseInt(row[9]) || 1,
          avgDailyConsumption: parseFloat(row[10]) || 0,
          hargaPerSatuanPorsi: parseFloat(row[11]) || 0,
        }).onConflictDoNothing();
        bahanCount++;
      }
    }

    // Insert mapping_resep from mapping_pawoon sheet
    // Expected columns: id | parent_id | parent_type | item_id | item_type | qty
    for (const row of mappingRows) {
      if (row[0] && row[1] && row[3]) {
        await db.insert(mappingResep).values({
          id: row[0],
          parentId: row[1],
          parentType: (row[2] === "semi_finished" ? "semi_finished" : "menu") as "menu" | "semi_finished",
          itemId: row[3],
          itemType: (row[4] === "semi_finished" ? "semi_finished" : "bahan_dasar") as "bahan_dasar" | "semi_finished",
          qty: parseFloat(row[5]) || 0,
        }).onConflictDoNothing();
        mappingCount++;
      }
    }

    // Mark migration as done
    await db.insert(systemConfigs).values({
      key: "is_initial_migration_done",
      value: "true",
    }).onConflictDoNothing();

    return NextResponse.json({
      message: `Berhasil: ${outletCount} outlet, ${bahanCount} bahan baku, ${mappingCount} mapping resep dimigrasikan.`,
    });
  } catch (error: unknown) {
    console.error("Migration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Migration gagal: ${message}` }, { status: 500 });
  }
}
