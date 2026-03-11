import { pgTable, text, integer, real, pgEnum, boolean, timestamp, date, index } from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["admin", "manager"]);

export const kategoriBahanEnum = pgEnum("kategori_bahan", [
  "bahan_mentah",
  "bumbu",
  "kemasan",
  "addon",
  "lainnya",
]);

export const kategoriMenuEnum = pgEnum("kategori_menu", ["food", "beverage"]);

export const tipeBahanEnum = pgEnum("tipe_bahan", ["packaged", "raw_bulk"]);

export const avgConsumptionSourceEnum = pgEnum("avg_consumption_source", ["manual", "auto"]);

export const parentTypeEnum = pgEnum("parent_type", ["menu", "semi_finished"]);

export const itemTypeEnum = pgEnum("item_type", ["bahan_dasar", "semi_finished"]);

export const poStatusEnum = pgEnum("po_status", ["draft", "sent", "received"]);

// ── 1. system_configs ──────────────────────────────────
export const systemConfigs = pgTable("system_configs", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ── 2. users (BARU) ───────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(), // USR-xxx
  email: text("email").notNull().unique(),
  nama: text("nama").notNull(),
  role: userRoleEnum("role").notNull().default("manager"),
  passwordHash: text("password_hash"),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  outletId: text("outlet_id").references(() => outlets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  outletIdIdx: index("users_outlet_id_idx").on(table.outletId),
}));

// ── 3. outlets ─────────────────────────────────────────
export const outlets = pgTable("outlets", {
  id: text("id").primaryKey(), // OUT-xxx
  namaOutlet: text("nama_outlet").notNull(),
});

// ── 4. master_bahan (DIREVISI) ─────────────────────────
// NOTE: stok_saat_ini REMOVED per PRD - stock is transient from uploads only
export const masterBahan = pgTable("master_bahan", {
  id: text("id").primaryKey(), // BHN-xxx
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  namaBahan: text("nama_bahan").notNull(),
  tipeBahan: tipeBahanEnum("tipe_bahan").notNull().default("packaged"),
  kategoriBahan: kategoriBahanEnum("kategori_bahan").notNull().default("bahan_mentah"),
  hargaBeli: real("harga_beli").notNull().default(0),
  satuanBeli: text("satuan_beli").notNull().default("kg"),
  isiSatuan: real("isi_satuan").notNull().default(1),
  satuanDapur: text("satuan_dapur").notNull().default("kg"),
  stokMinimum: integer("stok_minimum").notNull().default(0),
  leadTimeDays: integer("lead_time_days").notNull().default(1),
  avgDailyConsumption: real("avg_daily_consumption").notNull().default(0),
  avgConsumptionSource: avgConsumptionSourceEnum("avg_consumption_source").notNull().default("manual"),
  hargaPerSatuanPorsi: real("harga_per_satuan_porsi").notNull().default(0),
}, (table) => ({
  outletIdIdx: index("master_bahan_outlet_id_idx").on(table.outletId),
}));

// ── 5. master_menu (DIREVISI — resep_id dihapus) ──────
export const masterMenu = pgTable("master_menu", {
  id: text("id").primaryKey(), // MNU-xxx
  namaMenu: text("nama_menu").notNull(),
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  kategori: kategoriMenuEnum("kategori"),
  hargaJual: real("harga_jual").notNull().default(0),
  totalCogs: real("total_cogs").notNull().default(0),
}, (table) => ({
  outletIdIdx: index("master_menu_outlet_id_idx").on(table.outletId),
}));

// ── 6. semi_finished (BARU — 2-Level BOM) ─────────────
export const semiFinished = pgTable("semi_finished", {
  id: text("id").primaryKey(), // SFG-xxx
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  namaSemiFinished: text("nama_semi_finished").notNull(),
  satuan: text("satuan").notNull().default("kg"),
  stokMinimum: real("stok_minimum").notNull().default(0),
}, (table) => ({
  outletIdIdx: index("semi_finished_outlet_id_idx").on(table.outletId),
}));

// ── 7. mapping_resep (DIREVISI — 2-level support) ─────
export const mappingResep = pgTable("mapping_resep", {
  id: text("id").primaryKey(), // RSP-xxx
  parentId: text("parent_id").notNull(), // MNU-xxx or SFG-xxx
  parentType: parentTypeEnum("parent_type").notNull().default("menu"),
  itemId: text("item_id").notNull(), // BHN-xxx or SFG-xxx
  itemType: itemTypeEnum("item_type").notNull().default("bahan_dasar"),
  qty: real("qty").notNull().default(0),
});

// ── 8. master_vendor (DIREVISI) ────────────────────────
export const masterVendor = pgTable("master_vendor", {
  id: text("id").primaryKey(), // VND-xxx
  namaVendor: text("nama_vendor").notNull(),
  noRekening: text("no_rekening"),
  kontakWa: text("kontak_wa"),
  estimasiPengiriman: integer("estimasi_pengiriman").notNull().default(1),
});

// ── 9. vendor_bahan (BARU — Many-to-Many) ─────────────
export const vendorBahan = pgTable("vendor_bahan", {
  id: text("id").primaryKey(), // VBH-xxx
  vendorId: text("vendor_id")
    .notNull()
    .references(() => masterVendor.id),
  bahanId: text("bahan_id")
    .notNull()
    .references(() => masterBahan.id),
  hargaPerSatuan: real("harga_per_satuan").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
}, (table) => ({
  vendorIdIdx: index("vendor_bahan_vendor_id_idx").on(table.vendorId),
  bahanIdIdx: index("vendor_bahan_bahan_id_idx").on(table.bahanId),
}));

// ── 10. sales_transactions (BARU — Audit Pawoon) ──────
export const salesTransactions = pgTable("sales_transactions", {
  id: text("id").primaryKey(), // TRX-xxx
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  uploadBatchId: text("upload_batch_id").notNull(),
  tanggalTransaksi: date("tanggal_transaksi").notNull(),
  menuId: text("menu_id")
    .notNull()
    .references(() => masterMenu.id),
  qtyTerjual: integer("qty_terjual").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  outletIdIdx: index("sales_transactions_outlet_id_idx").on(table.outletId),
  menuIdIdx: index("sales_transactions_menu_id_idx").on(table.menuId),
  uploadBatchIdIdx: index("sales_transactions_upload_batch_id_idx").on(table.uploadBatchId),
}));

// ── 11. purchase_orders (BARU — PO Tracking) ──────────
export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id").primaryKey(), // PO-xxx
  outletId: text("outlet_id")
    .notNull()
    .references(() => outlets.id),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => masterVendor.id),
  bahanId: text("bahan_id")
    .notNull()
    .references(() => masterBahan.id),
  status: poStatusEnum("status").notNull().default("draft"),
  qtyOrder: real("qty_order").notNull().default(0),
  hargaSatuan: real("harga_satuan").notNull().default(0),
  totalHarga: real("total_harga").notNull().default(0),
  aiNotes: text("ai_notes"),
  tanggalKirim: timestamp("tanggal_kirim"),
  tanggalTerima: timestamp("tanggal_terima"),
  createdBy: text("created_by")
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  outletIdIdx: index("purchase_orders_outlet_id_idx").on(table.outletId),
  vendorIdIdx: index("purchase_orders_vendor_id_idx").on(table.vendorId),
  bahanIdIdx: index("purchase_orders_bahan_id_idx").on(table.bahanId),
  createdByIdx: index("purchase_orders_created_by_idx").on(table.createdBy),
  statusIdx: index("purchase_orders_status_idx").on(table.status),
}));

// ── Type exports ───────────────────────────────────────
export type SystemConfig = typeof systemConfigs.$inferSelect;
export type User = typeof users.$inferSelect;
export type Outlet = typeof outlets.$inferSelect;
export type MasterBahan = typeof masterBahan.$inferSelect;
export type MasterMenu = typeof masterMenu.$inferSelect;
export type SemiFinished = typeof semiFinished.$inferSelect;
export type MappingResep = typeof mappingResep.$inferSelect;
export type MasterVendor = typeof masterVendor.$inferSelect;
export type VendorBahan = typeof vendorBahan.$inferSelect;
export type SalesTransaction = typeof salesTransactions.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
