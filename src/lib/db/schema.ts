import { pgTable, text, integer, real, pgEnum } from "drizzle-orm/pg-core";

export const kategoriBahanEnum = pgEnum("kategori_bahan", [
  "bahan_mentah",
  "bahan_setengah_jadi",
  "bumbu",
  "kemasan",
  "addon",
  "lainnya",
]);

export const itemTypeEnum = pgEnum("item_type", [
  "bahan_mentah",
  "bahan_setengah_jadi",
  "addon",
]);

// System configuration store (migration lock, etc.)
export const systemConfigs = pgTable("system_configs", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Outlets / branches
export const outlets = pgTable("outlets", {
  id: text("id").primaryKey(), // OUT-xxx
  namaOutlet: text("nama_outlet").notNull(),
});

// Master bahan baku (raw materials catalog)
export const masterBahan = pgTable("master_bahan", {
  id: text("id").primaryKey(), // BHN-xxx
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  namaBahan: text("nama_bahan").notNull(),
  kategoriBahan: kategoriBahanEnum("kategori_bahan").notNull().default("bahan_mentah"),
  hargaBeli: real("harga_beli").notNull().default(0),
  satuanBeli: text("satuan_beli").notNull().default("kg"),
  isiSatuan: real("isi_satuan").notNull().default(1),
  satuanDapur: text("satuan_dapur").notNull().default("kg"),
  stokSaatIni: real("stok_saat_ini").notNull().default(0),
  stokMinimum: integer("stok_minimum").notNull().default(0),
  leadTimeDays: integer("lead_time_days").notNull().default(1),
  avgDailyConsumption: real("avg_daily_consumption").notNull().default(0),
  hargaPerSatuanPorsi: real("harga_per_satuan_porsi").notNull().default(0),
});

// Master menu (finished products)
export const masterMenu = pgTable("master_menu", {
  id: text("id").primaryKey(), // MNU-xxx
  namaMenu: text("nama_menu").notNull(),
  resepId: text("resep_id"),
  hargaJual: real("harga_jual").notNull().default(0),
  totalCogs: real("total_cogs").notNull().default(0),
});

// Mapping resep (recipe: menu → bahan)
export const mappingResep = pgTable("mapping_resep", {
  id: text("id").primaryKey(), // RSP-xxx
  parentId: text("parent_id")
    .notNull()
    .references(() => masterMenu.id),
  itemId: text("item_id")
    .notNull()
    .references(() => masterBahan.id),
  itemType: itemTypeEnum("item_type").notNull().default("bahan_mentah"),
  qty: real("qty").notNull().default(0),
});

// Master vendor (suppliers)
export const masterVendor = pgTable("master_vendor", {
  id: text("id").primaryKey(), // VND-xxx
  namaVendor: text("nama_vendor").notNull(),
  bahanBakuList: text("bahan_baku_list"), // JSON string of bahan IDs
  noRekening: text("no_rekening"),
  estimasiPengiriman: text("estimasi_pengiriman"),
});

// Type exports for convenience
export type SystemConfig = typeof systemConfigs.$inferSelect;
export type Outlet = typeof outlets.$inferSelect;
export type MasterBahan = typeof masterBahan.$inferSelect;
export type MasterMenu = typeof masterMenu.$inferSelect;
export type MappingResep = typeof mappingResep.$inferSelect;
export type MasterVendor = typeof masterVendor.$inferSelect;
