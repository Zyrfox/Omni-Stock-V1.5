import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. system_configs
  await db.insert(schema.systemConfigs)
    .values({ key: "is_initial_migration_done", value: "false" })
    .onConflictDoNothing();

  // 2. users — seed admin user first
  const seedUsers = [
    { id: "USR-001", email: "admin@easygoing.com", nama: "Admin Utama", role: "admin" as const },
    { id: "USR-002", email: "manager@easygoing.com", nama: "Manager Outlet", role: "manager" as const },
  ];
  for (const u of seedUsers) {
    await db.insert(schema.users).values(u).onConflictDoNothing();
  }

  // 3. outlets
  const seedOutlets = [
    { id: "OUT-001", namaOutlet: "Outlet Pusat" },
    { id: "OUT-002", namaOutlet: "Outlet Cabang 1" },
    { id: "OUT-003", namaOutlet: "Outlet Cabang 2" },
  ];
  for (const o of seedOutlets) {
    await db.insert(schema.outlets).values(o).onConflictDoNothing();
  }

  // 4. master_bahan (with tipe_bahan)
  const seedBahan = [
    { id: "BHN-001", outletId: "OUT-001", namaBahan: "Cabe Rawit", tipeBahan: "raw_bulk" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 45000, satuanBeli: "kg", isiSatuan: 1, satuanDapur: "g", stokSaatIni: 500, stokMinimum: 200, leadTimeDays: 1, avgDailyConsumption: 500, hargaPerSatuanPorsi: 4500 },
    { id: "BHN-002", outletId: "OUT-001", namaBahan: "Beras Premium", tipeBahan: "raw_bulk" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 14000, satuanBeli: "kg", isiSatuan: 1, satuanDapur: "kg", stokSaatIni: 50, stokMinimum: 10, leadTimeDays: 3, avgDailyConsumption: 8, hargaPerSatuanPorsi: 1400 },
    { id: "BHN-003", outletId: "OUT-001", namaBahan: "Chicken Katsu (pack)", tipeBahan: "packaged" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 38000, satuanBeli: "pack", isiSatuan: 1, satuanDapur: "pack", stokSaatIni: 1, stokMinimum: 2, leadTimeDays: 3, avgDailyConsumption: 2, hargaPerSatuanPorsi: 3800 },
    { id: "BHN-004", outletId: "OUT-001", namaBahan: "Minyak Goreng", tipeBahan: "raw_bulk" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 18000, satuanBeli: "liter", isiSatuan: 1, satuanDapur: "liter", stokSaatIni: 20, stokMinimum: 5, leadTimeDays: 2, avgDailyConsumption: 3, hargaPerSatuanPorsi: 1800 },
    { id: "BHN-005", outletId: "OUT-001", namaBahan: "Bawang Merah", tipeBahan: "raw_bulk" as const, kategoriBahan: "bumbu" as const, hargaBeli: 35000, satuanBeli: "kg", isiSatuan: 1, satuanDapur: "g", stokSaatIni: 100, stokMinimum: 200, leadTimeDays: 1, avgDailyConsumption: 300, hargaPerSatuanPorsi: 3500 },
  ];
  for (const b of seedBahan) {
    await db.insert(schema.masterBahan).values(b).onConflictDoNothing();
  }

  // 5. master_menu
  const seedMenu = [
    { id: "MNU-001", namaMenu: "Nasi Ayam Geprek", hargaJual: 25000, totalCogs: 12000 },
    { id: "MNU-002", namaMenu: "Sambal Bawang Rice Bowl", hargaJual: 22000, totalCogs: 9000 },
  ];
  for (const m of seedMenu) {
    await db.insert(schema.masterMenu).values(m).onConflictDoNothing();
  }

  // 6. semi_finished
  await db.insert(schema.semiFinished).values({
    id: "SFG-001", outletId: "OUT-001", namaSemiFinished: "Sambal Bawang Base", satuan: "g", stokMinimum: 100,
  }).onConflictDoNothing();

  // 7. mapping_resep — 2-level BOM demo
  const seedResep = [
    // MNU-001 (Nasi Ayam Geprek) → direct bahan
    { id: "RSP-001", parentId: "MNU-001", parentType: "menu" as const, itemId: "BHN-002", itemType: "bahan_dasar" as const, qty: 0.15 },
    { id: "RSP-002", parentId: "MNU-001", parentType: "menu" as const, itemId: "BHN-003", itemType: "bahan_dasar" as const, qty: 1 },
    { id: "RSP-003", parentId: "MNU-001", parentType: "menu" as const, itemId: "BHN-004", itemType: "bahan_dasar" as const, qty: 0.1 },
    // MNU-002 (Sambal Bawang Rice Bowl) → uses semi_finished
    { id: "RSP-004", parentId: "MNU-002", parentType: "menu" as const, itemId: "BHN-002", itemType: "bahan_dasar" as const, qty: 0.15 },
    { id: "RSP-005", parentId: "MNU-002", parentType: "menu" as const, itemId: "SFG-001", itemType: "semi_finished" as const, qty: 30 },
    // SFG-001 (Sambal Bawang Base) → bahan dasar
    { id: "RSP-006", parentId: "SFG-001", parentType: "semi_finished" as const, itemId: "BHN-001", itemType: "bahan_dasar" as const, qty: 5 },
    { id: "RSP-007", parentId: "SFG-001", parentType: "semi_finished" as const, itemId: "BHN-005", itemType: "bahan_dasar" as const, qty: 10 },
    { id: "RSP-008", parentId: "SFG-001", parentType: "semi_finished" as const, itemId: "BHN-004", itemType: "bahan_dasar" as const, qty: 0.02 },
  ];
  for (const r of seedResep) {
    await db.insert(schema.mappingResep).values(r).onConflictDoNothing();
  }

  // 8. master_vendor (revised — no bahanBakuList)
  const seedVendors = [
    { id: "VND-001", namaVendor: "PT Sumber Rasa", noRekening: "BCA 123-456-7890", estimasiPengiriman: 2, kontak: "081234567890" },
    { id: "VND-002", namaVendor: "CV Bahan Pokok Jaya", noRekening: "Mandiri 987-654-3210", estimasiPengiriman: 3, kontak: "089876543210" },
  ];
  for (const v of seedVendors) {
    await db.insert(schema.masterVendor).values(v).onConflictDoNothing();
  }

  // 9. vendor_bahan (many-to-many)
  const seedVB = [
    { id: "VBH-001", vendorId: "VND-001", bahanId: "BHN-001", hargaPerSatuan: 45000, isPrimary: true },
    { id: "VBH-002", vendorId: "VND-001", bahanId: "BHN-003", hargaPerSatuan: 38000, isPrimary: true },
    { id: "VBH-003", vendorId: "VND-001", bahanId: "BHN-005", hargaPerSatuan: 35000, isPrimary: true },
    { id: "VBH-004", vendorId: "VND-002", bahanId: "BHN-002", hargaPerSatuan: 14000, isPrimary: true },
    { id: "VBH-005", vendorId: "VND-002", bahanId: "BHN-004", hargaPerSatuan: 18000, isPrimary: true },
  ];
  for (const vb of seedVB) {
    await db.insert(schema.vendorBahan).values(vb).onConflictDoNothing();
  }

  console.log("Seed complete!");
  console.log("   - 2 users (admin + manager)");
  console.log("   - 3 outlets");
  console.log("   - 5 bahan baku (3 raw_bulk, 2 packaged) with 3-tier status test data");
  console.log("   - 2 menus + 1 semi-finished (2-level BOM demo)");
  console.log("   - 2 vendors + 5 vendor-bahan mappings");
}

seed().catch(console.error);
