import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed system_configs
  await db
    .insert(schema.systemConfigs)
    .values({ key: "is_initial_migration_done", value: "false" })
    .onConflictDoNothing();

  // Seed sample outlets
  const sampleOutlets = [
    { id: "OUT-001", namaOutlet: "Outlet Pusat" },
    { id: "OUT-002", namaOutlet: "Outlet Cabang 1" },
    { id: "OUT-003", namaOutlet: "Outlet Cabang 2" },
  ];
  for (const outlet of sampleOutlets) {
    await db.insert(schema.outlets).values(outlet).onConflictDoNothing();
  }

  // Seed sample bahan baku
  const sampleBahan = [
    {
      id: "BHN-001",
      outletId: "OUT-001",
      namaBahan: "Cabe Rawit",
      kategoriBahan: "bahan_mentah" as const,
      hargaBeli: 45000,
      satuanBeli: "kg",
      isiSatuan: 1,
      satuanDapur: "kg",
      stokSaatIni: 5,
      stokMinimum: 3,
      leadTimeDays: 2,
      avgDailyConsumption: 2,
      hargaPerSatuanPorsi: 4500,
    },
    {
      id: "BHN-002",
      outletId: "OUT-001",
      namaBahan: "Beras Premium",
      kategoriBahan: "bahan_mentah" as const,
      hargaBeli: 14000,
      satuanBeli: "kg",
      isiSatuan: 1,
      satuanDapur: "kg",
      stokSaatIni: 50,
      stokMinimum: 10,
      leadTimeDays: 3,
      avgDailyConsumption: 8,
      hargaPerSatuanPorsi: 1400,
    },
    {
      id: "BHN-003",
      outletId: "OUT-001",
      namaBahan: "Ayam Potong",
      kategoriBahan: "bahan_mentah" as const,
      hargaBeli: 38000,
      satuanBeli: "kg",
      isiSatuan: 1,
      satuanDapur: "kg",
      stokSaatIni: 8,
      stokMinimum: 5,
      leadTimeDays: 1,
      avgDailyConsumption: 4,
      hargaPerSatuanPorsi: 3800,
    },
    {
      id: "BHN-004",
      outletId: "OUT-001",
      namaBahan: "Minyak Goreng",
      kategoriBahan: "bahan_mentah" as const,
      hargaBeli: 18000,
      satuanBeli: "liter",
      isiSatuan: 1,
      satuanDapur: "liter",
      stokSaatIni: 20,
      stokMinimum: 5,
      leadTimeDays: 2,
      avgDailyConsumption: 3,
      hargaPerSatuanPorsi: 1800,
    },
    {
      id: "BHN-005",
      outletId: "OUT-001",
      namaBahan: "Gula Pasir",
      kategoriBahan: "bumbu" as const,
      hargaBeli: 16000,
      satuanBeli: "kg",
      isiSatuan: 1,
      satuanDapur: "kg",
      stokSaatIni: 2,
      stokMinimum: 3,
      leadTimeDays: 2,
      avgDailyConsumption: 1.5,
      hargaPerSatuanPorsi: 1600,
    },
  ];
  for (const bahan of sampleBahan) {
    await db.insert(schema.masterBahan).values(bahan).onConflictDoNothing();
  }

  // Seed sample vendor
  await db
    .insert(schema.masterVendor)
    .values({
      id: "VND-001",
      namaVendor: "PT Sumber Rasa",
      bahanBakuList: "BHN-001, BHN-003, BHN-005",
      noRekening: "BCA 123-456-7890",
      estimasiPengiriman: "1-2 hari kerja",
    })
    .onConflictDoNothing();

  await db
    .insert(schema.masterVendor)
    .values({
      id: "VND-002",
      namaVendor: "CV Bahan Pokok Jaya",
      bahanBakuList: "BHN-002, BHN-004",
      noRekening: "Mandiri 987-654-3210",
      estimasiPengiriman: "2-3 hari kerja",
    })
    .onConflictDoNothing();

  // Seed sample menu
  await db
    .insert(schema.masterMenu)
    .values({
      id: "MNU-001",
      namaMenu: "Nasi Ayam Geprek",
      resepId: "RSP-001",
      hargaJual: 25000,
      totalCogs: 12000,
    })
    .onConflictDoNothing();

  // Seed sample mapping resep
  const sampleResep = [
    { id: "RSP-001", parentId: "MNU-001", itemId: "BHN-002", itemType: "bahan_mentah" as const, qty: 0.15 },
    { id: "RSP-002", parentId: "MNU-001", itemId: "BHN-003", itemType: "bahan_mentah" as const, qty: 0.2 },
    { id: "RSP-003", parentId: "MNU-001", itemId: "BHN-001", itemType: "bahan_mentah" as const, qty: 0.05 },
    { id: "RSP-004", parentId: "MNU-001", itemId: "BHN-004", itemType: "bahan_mentah" as const, qty: 0.1 },
  ];
  for (const resep of sampleResep) {
    await db.insert(schema.mappingResep).values(resep).onConflictDoNothing();
  }

  console.log("✅ Seed complete!");
  console.log("   - 3 outlets");
  console.log("   - 5 bahan baku (with 3-tier status test data)");
  console.log("   - 2 vendors");
  console.log("   - 1 menu with 4 recipe mappings");
}

seed().catch(console.error);
