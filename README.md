# Omni-Stock V1.5 — The Predictive Watchdog

Platform manajemen persediaan terpusat untuk bisnis F&B multi-outlet milik Easy Going Group. Sistem back-office yang menarik data dari Pawoon POS (via Excel), membedah menu menjadi komponen bahan baku melalui Bill of Materials (BOM), dan melacak serta memprediksi kebutuhan stok dengan AI prediction engine.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Fullstack Framework** | Next.js 15 (App Router, Server Components + Server Actions) |
| **UI Library** | shadcn/ui (Dark theme preset) |
| **Styling** | Tailwind CSS v3 (utility-first, custom dark tokens) |
| **Database** | Supabase PostgreSQL (managed, realtime, PITR built-in) |
| **ORM** | Drizzle ORM (type-safe, null-safe, push migration) |
| **Auth** | Better Auth (TypeScript-native, credential provider + optional Google SSO) |
| **AI Engine** | Google Gemini API (Flash/Pro model, web research untuk harga pasar) |
| **Deployment** | Vercel (Edge network, auto-deploy) |
| **Backup** | Supabase PITR (Point-in-Time Recovery, Pro plan) |
| **Integrasi POS** | xlsx / SheetJS (parse `.xls` dan `.xlsx` dari upload Pawoon) |
| **Integrasi Legacy** | Google Sheets API (one-time migration, Service Account auth) |

## Quick Start

### 1. Install Dependencies

```bash
cd omni-stock
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Seed Sample Data (Optional)

```bash
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Core Features

### Login (Better Auth — Email + Password)
Login aman menggunakan Better Auth dengan email dan password terdaftar. Mendukung role Admin dan Manager. Session JWT 7 hari.

### One-Way Bridge (Migrasi GSheet → Supabase)
Tombol "Sync from GSheet" di halaman Settings. Migrasi satu kali dari Google Sheets ke Supabase PostgreSQL, tombol otomatis terkunci (disabled) setelah sukses.

### Upload Pawoon Excel
Upload file .xls/.xlsx dari Pawoon POS. Sistem mem-parse data kartu stok dan menampilkan tabel bahan baku dengan status 3 warna.

### Three-Tier Status Logic (Server-Side)
- 🟢 **SAFE:** `Stok > (Min + Lead Time × Konsumsi Harian)`
- 🟠 **WARNING:** `Stok ≤ (Min + Lead Time × Konsumsi Harian)` — Reorder Point
- 🔴 **CRITICAL:** `Stok ≤ Stok Minimum`

> ⚠️ `stok_akhir` bukan kolom permanen di database. Nilainya adalah data transient dari hasil upload kartu stok.

### AI Predictive Restock (Gemini API)
Analisis prediktif menggunakan Google Gemini API. Memberikan rekomendasi restock per item beserta estimasi hari habis stok. Template prompt berbeda untuk `packaged` vs `raw_bulk`.

### Bill of Materials (BOM) — Multi-Level
Mapping 2 level: `menu → semi_finished → bahan_dasar`. Editor BOM dengan real-time COGS calculation.

### Vendor & Purchase Order
Daftar pemasok dan pengadaan bahan baku. PO lifecycle: DRAFT → SENT → RECEIVED. Dual template untuk Packaged dan Raw/Bulk.

## Database Schema

11 tabel dengan Drizzle ORM. Custom text primary keys (e.g., `OUT-001`, `BHN-001`, `MNU-001`). **Tidak menggunakan UUID.**

| Table | Prefix | Description |
|-------|--------|-------------|
| `system_configs` | — | Key-value config global |
| `users` | `USR-xxx` | Akun pengguna + role (admin/manager) |
| `outlets` | `OUT-xxx` | Data cabang/outlet |
| `master_bahan` | `BHN-xxx` | Katalog bahan baku + tipe + threshold |
| `semi_finished` | `SFG-xxx` | Bahan setengah jadi (BOM level 2) |
| `master_menu` | `MNU-xxx` | Menu final yang dijual |
| `mapping_resep` | `RSP-xxx` | Junction BOM (menu/SFG → bahan/SFG) |
| `master_vendor` | `VND-xxx` | Data pemasok |
| `vendor_bahan` | `VBH-xxx` | Many-to-many vendor ↔ bahan |
| `sales_transactions` | `TRX-xxx` | Log penjualan dari upload Pawoon |
| `purchase_orders` | `PO-xxx` | PO dengan status tracking |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth handler
│   │   ├── migration/           # GSheet one-way sync
│   │   ├── upload-excel/        # Pawoon Excel parser
│   │   ├── ai-predict/          # AI prediction engine (Gemini)
│   │   ├── purchase-orders/     # PO CRUD + state machine
│   │   ├── master-bahan/        # Bahan CRUD
│   │   ├── master-menu/         # Menu CRUD
│   │   ├── mapping-resep/       # BOM/Recipe CRUD
│   │   ├── vendors/             # Vendor CRUD
│   │   └── users/               # User management
│   ├── (app)/                   # Protected route group
│   │   ├── dashboard/           # Upload + stat cards + inventory table
│   │   ├── stores/              # Compliance + profitability
│   │   ├── products/            # Master bahan + BOM + menu
│   │   ├── category/            # Assets & inventory (3 tabs)
│   │   ├── suppliers/           # Vendor & PO cart
│   │   ├── billing/             # Billing & pembayaran
│   │   ├── upload-history/      # Riwayat upload Pawoon
│   │   ├── po-logs/             # Log purchase order
│   │   ├── delivery/            # Konfirmasi terima PO
│   │   ├── report/              # Laporan + chart
│   │   ├── users/               # User management (Admin only)
│   │   └── settings/            # System config (Admin only)
│   ├── change-password/         # Ganti password pertama kali
│   └── login/                   # Halaman login
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── migration-card.tsx       # One-way bridge card
│   ├── sidebar.tsx              # Navigation sidebar
│   ├── topbar.tsx               # Topbar dengan notifikasi
│   └── shell-layout.tsx         # Shell wrapper
├── hooks/
│   └── use-toast.ts
└── lib/
    ├── auth.ts                  # Better Auth config + session helpers
    ├── auth-client.ts           # Better Auth client (browser)
    ├── db/
    │   ├── index.ts             # Drizzle client (Supabase PostgreSQL)
    │   ├── schema.ts            # 11 tabel aplikasi
    │   ├── auth-schema.ts       # Better Auth tables
    │   └── seed.ts              # Sample data seeder
    └── utils.ts                 # Status 3-warna + helpers
```

## Environment Variables

See `.env.example` for all required variables (PRD Section 21).

## License

Confidential — Easy Going Group © 2026
