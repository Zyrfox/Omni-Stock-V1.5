import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import "dotenv/config";
import { auth } from "../auth";

// Use pooler connection for runtime/seed (port 6543)
const connectionUrl = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL!;
const client = postgres(connectionUrl, { ssl: "require", max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. system_configs
  await db.insert(schema.systemConfigs)
    .values({ key: "is_initial_migration_done", value: "false" })
    .onConflictDoNothing();

  // 2. outlets (must come before users due to FK)
  const seedOutlets = [
    { id: "OUT-001", namaOutlet: "Outlet Pusat" },
    { id: "OUT-002", namaOutlet: "Outlet Cabang 1" },
    { id: "OUT-003", namaOutlet: "Outlet Cabang 2" },
  ];
  for (const o of seedOutlets) {
    await db.insert(schema.outlets).values(o).onConflictDoNothing();
  }

  // 3. users — seed via Better Auth API so credentials exist in auth tables
  const authUsers = [
    { email: "admin@easygoing.com", password: "admin123", name: "Admin Utama" },
    { email: "manager@easygoing.com", password: "manager123", name: "Manager Outlet" },
  ];
  for (const u of authUsers) {
    try {
      await auth.api.signUpEmail({ body: { email: u.email, password: u.password, name: u.name } });
      console.log(`   ✓ Auth user created: ${u.email}`);
    } catch {
      console.log(`   - Auth user already exists or failed: ${u.email}`);
    }
  }

  // Also ensure app-level user records exist (role, outlet, etc.)
  const seedUsers = [
    {
      id: "USR-001",
      email: "admin@easygoing.com",
      nama: "Admin Utama",
      role: "admin" as const,
      mustChangePassword: false,
      outletId: null,
    },
    {
      id: "USR-002",
      email: "manager@easygoing.com",
      nama: "Manager Outlet",
      role: "manager" as const,
      mustChangePassword: true,
      outletId: "OUT-001",
    },
  ];
  for (const u of seedUsers) {
    await db.insert(schema.users).values(u).onConflictDoNothing();
  }
  
  console.log("\n🔐 ADMIN CREDENTIALS:");
  console.log("   Email: admin@easygoing.com");
  console.log("   Password: admin123");
  console.log("\n🔐 MANAGER CREDENTIALS:");
  console.log("   Email: manager@easygoing.com");
  console.log("   Password: manager123\n");

  // 4. master_bahan (stok_saat_ini REMOVED per PRD - stock is transient from uploads)
  const seedBahan = [
    { id: "BHN-001", outletId: "OUT-001", namaBahan: "Cabe Rawit", tipeBahan: "raw_bulk" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 45000, satuanBeli: "kg", isiSatuan: 1, satuanDapur: "g", stokMinimum: 200, leadTimeDays: 1, avgDailyConsumption: 500, hargaPerSatuanPorsi: 45 },
    { id: "BHN-002", outletId: "OUT-001", namaBahan: "Beras Premium", tipeBahan: "raw_bulk" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 14000, satuanBeli: "kg", isiSatuan: 1, satuanDapur: "kg", stokMinimum: 10, leadTimeDays: 3, avgDailyConsumption: 8, hargaPerSatuanPorsi: 14000 },
    { id: "BHN-003", outletId: "OUT-001", namaBahan: "Chicken Katsu (pack)", tipeBahan: "packaged" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 38000, satuanBeli: "pack", isiSatuan: 1, satuanDapur: "pack", stokMinimum: 2, leadTimeDays: 3, avgDailyConsumption: 2, hargaPerSatuanPorsi: 38000 },
    { id: "BHN-004", outletId: "OUT-001", namaBahan: "Minyak Goreng", tipeBahan: "raw_bulk" as const, kategoriBahan: "bahan_mentah" as const, hargaBeli: 18000, satuanBeli: "liter", isiSatuan: 1, satuanDapur: "liter", stokMinimum: 5, leadTimeDays: 2, avgDailyConsumption: 3, hargaPerSatuanPorsi: 18000 },
    { id: "BHN-005", outletId: "OUT-001", namaBahan: "Bawang Merah", tipeBahan: "raw_bulk" as const, kategoriBahan: "bumbu" as const, hargaBeli: 35000, satuanBeli: "kg", isiSatuan: 1, satuanDapur: "g", stokMinimum: 200, leadTimeDays: 1, avgDailyConsumption: 300, hargaPerSatuanPorsi: 35 },
  ];
  for (const b of seedBahan) {
    await db.insert(schema.masterBahan).values(b).onConflictDoNothing();
  }

  // 5. master_menu (added outlet_id and kategori per PRD)
  const seedMenu = [
    { id: "MNU-001", namaMenu: "Nasi Ayam Geprek", outletId: "OUT-001", kategori: "food" as const, hargaJual: 25000, totalCogs: 12000 },
    { id: "MNU-002", namaMenu: "Sambal Bawang Rice Bowl", outletId: "OUT-001", kategori: "food" as const, hargaJual: 22000, totalCogs: 9000 },
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

  // 8. master_vendor (kontak renamed to kontakWa per PRD)
  const seedVendors = [
    { id: "VND-001", namaVendor: "PT Sumber Rasa", noRekening: "BCA 123-456-7890", estimasiPengiriman: 2, kontakWa: "081234567890" },
    { id: "VND-002", namaVendor: "CV Bahan Pokok Jaya", noRekening: "Mandiri 987-654-3210", estimasiPengiriman: 3, kontakWa: "089876543210" },
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

  console.log("\n✅ Seed complete!");
  console.log("   - 2 users (admin + manager) with passwords");
  console.log("   - 3 outlets");
  console.log("   - 5 bahan baku (NO stok_saat_ini - stock is transient)");
  console.log("   - 2 menus + 1 semi-finished (2-level BOM demo)");
  console.log("   - 2 vendors + 5 vendor-bahan mappings");
  console.log("\n⚠️  IMPORTANT: Stock data comes from Excel uploads, not from master_bahan!");
}

seed().catch(console.error);
