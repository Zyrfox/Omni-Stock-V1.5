# Omni-Stock V1.5 — The Predictive Watchdog

Platform manajemen persediaan terpusat untuk bisnis F&B dengan banyak cabang (multi-outlet). Sistem back-office yang menarik data dari Pawoon POS, membedah menu menjadi komponen bahan baku melalui Resep (Bill of Materials), dan melacak limit stok dengan AI prediction engine.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** Neon DB (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Auth:** NextAuth v5 (Google SSO)
- **AI Engine:** Vercel AI SDK + OpenAI
- **Deployment:** Vercel

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

### Login Eksekutif (Google SSO)
Login aman menggunakan email Google perusahaan. Admin-only access.

### One-Way Bridge (Migrasi GSheet)
Tombol "Sync from GSheet" di Dashboard. Migrasi satu kali dari Google Sheets, tombol otomatis terkunci (grey-out) setelah sukses.

### Upload Pawoon Excel
Upload file .xls/.xlsx dari Pawoon POS. Sistem mem-parse data dan menampilkan tabel bahan baku dengan status 3 warna.

### Three-Tier Status Logic
- 🟢 **SAFE:** `Stok > (Min + Lead Time × Konsumsi Harian)`
- 🟠 **WARNING:** `Stok ≤ (Min + Lead Time × Konsumsi Harian)` — Reorder Point
- 🔴 **CRITICAL:** `Stok ≤ Stok Minimum`

### AI Consultant Dashboard
Analisis prediktif menggunakan Vercel AI SDK. Memberikan rekomendasi "Order Now" atau "Safe" per item beserta estimasi hari habis stok.

### Manajemen Resep & Formula
Mapping bahan baku ke menu jual dengan takaran.

### Vendor & Purchase Order
Daftar pemasok dan pengadaan bahan baku berdasarkan rekomendasi AI.

## Database Schema

Custom text primary keys (e.g., `OUT-001`, `BHN-001`, `MNU-001`, `RSP-001`, `VND-001`).

| Table | Description |
|---|---|
| `system_configs` | System state (migration lock) |
| `outlets` | Cabang/outlet |
| `master_bahan` | Katalog bahan baku |
| `master_menu` | Katalog menu jual |
| `mapping_resep` | Relasi menu ↔ bahan |
| `master_vendor` | Daftar pemasok |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── migration/           # GSheet one-way sync
│   │   ├── upload-excel/        # Pawoon Excel parser
│   │   └── ai-predict/          # AI prediction engine
│   ├── dashboard/
│   │   ├── ai-consultant/       # AI recommendations
│   │   ├── materials/           # Bahan baku list
│   │   ├── recipes/             # Resep management
│   │   ├── settings/            # System config
│   │   ├── upload/              # Upload Pawoon Excel
│   │   └── vendors/             # Vendor & PO
│   └── login/                   # Google SSO login
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── migration-card.tsx       # One-way bridge card
│   └── sidebar.tsx              # Navigation sidebar
├── hooks/
│   └── use-toast.ts
└── lib/
    ├── auth.ts                  # NextAuth config
    ├── db/
    │   ├── index.ts             # Drizzle client
    │   ├── schema.ts            # Database schema
    │   └── seed.ts              # Sample data seeder
    └── utils.ts                 # Status logic & helpers
```
