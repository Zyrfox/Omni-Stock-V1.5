# CLAUDE.md — OMNI-STOCK V1.5 Engineering Guide

> Dokumen ini adalah kontrak teknis untuk semua pekerjaan di repo ini.
> **PRD FINAL:** `PRD_OmniStock_V1.5_FINAL.md` — baca dulu sebelum implementasi apapun.

---

## 1. Tech Stack (NON-NEGOTIABLE)

| Layer | Teknologi | JANGAN gunakan |
|---|---|---|
| Framework | Next.js 15, App Router | Pages Router |
| Database | **Supabase** PostgreSQL | Neon DB, PlanetScale |
| ORM | Drizzle ORM | Prisma, raw SQL |
| Auth | **Better Auth** | NextAuth / Auth.js |
| AI | **Google Gemini API** via `@ai-sdk/google` | OpenAI, Claude |
| UI | Tailwind CSS v3 + shadcn/ui | CSS Modules |

---

## 2. Aturan Kritis — WAJIB DIIKUTI

### 2.1 Database
- **TIDAK ADA kolom `stok_saat_ini`** di `master_bahan` dan `semi_finished`. Stok adalah transient dari upload Pawoon.
- **Semua ID menggunakan custom text**, bukan UUID:
  - `USR-001`, `OUT-001`, `BHN-001`, `SFG-001`, `MNU-001`, `RSP-001`
  - `VND-001`, `VBH-001`, `TRX-001`, `PO-001`
- Ada 11 tabel aplikasi + tabel Better Auth (terpisah di `auth-schema.ts`)
- Schema file: `src/lib/db/schema.ts` dan `src/lib/db/auth-schema.ts`

### 2.2 Auth Flow
- Login: email + password via Better Auth
- Jika `must_change_password = true` → redirect ke `/change-password` (dipaksakan di `(app)/layout.tsx`)
- Role guard untuk `/users` dan `/settings`: redirect ke `/dashboard` jika bukan admin
- Session JWT 7 hari

### 2.3 Status 3 Warna (Server-side only, BUKAN oleh AI)
```
CRITICAL: stokAkhir <= stokMinimum
WARNING:  stokAkhir <= stokMinimum + (leadTimeDays × avgDailyConsumption)
SAFE:     stokAkhir >  stokMinimum + (leadTimeDays × avgDailyConsumption)
```
Implementasi: `src/lib/utils.ts → getStockStatus()`

### 2.4 avg_daily_consumption
- Source `"manual"` → JANGAN diupdate saat upload Excel
- Source `"auto"` → update dengan EMA: `prevAvg * 0.7 + newDailyAvg * 0.3`
- Daily average dihitung dari `totalUsed / jumlahHariUnik` dalam satu batch upload

### 2.5 AI Engine
- Model: `gemini-1.5-flash` via `generateText` dari `@ai-sdk/google`
- 2 template prompt: `packaged` (ringkas) dan `raw_bulk` (dengan estimasi harga pasar + yield)
- AI hanya menghasilkan **teks narasi** — status warna dihitung server-side
- Teks AI disimpan di `purchase_orders.ai_notes`
- Fallback rule-based jika API Gemini gagal

---

## 3. Struktur Folder

```
src/
├── app/
│   ├── (app)/                    # Protected route group (semua butuh auth)
│   │   ├── layout.tsx            # Cek session + mustChangePassword + shell
│   │   ├── dashboard/
│   │   ├── stores/
│   │   ├── products/
│   │   ├── category/
│   │   ├── suppliers/
│   │   ├── billing/
│   │   ├── upload-history/
│   │   ├── po-logs/
│   │   ├── delivery/
│   │   ├── report/
│   │   ├── users/                # Admin only — server redirect jika bukan admin
│   │   └── settings/             # Admin only — server redirect jika bukan admin
│   ├── api/
│   │   ├── auth/[...all]/        # Better Auth handler
│   │   ├── upload-excel/         # Parse Pawoon .xls/.xlsx
│   │   ├── ai-predict/           # Gemini AI recommendations
│   │   ├── migration/            # One-way GSheet sync (admin only)
│   │   ├── purchase-orders/      # PO CRUD + state machine
│   │   ├── users/                # User management (admin only)
│   │   └── change-password/      # Ganti password pertama kali
│   ├── change-password/          # Halaman ganti password (di luar protected group)
│   └── login/                    # Halaman login
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── shell-layout.tsx
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   └── migration-card.tsx
├── hooks/
│   └── use-toast.ts
└── lib/
    ├── auth.ts                   # Better Auth config + getSessionUser() + isAdmin()
    ├── auth-client.ts            # Better Auth client (browser-side signIn/signOut)
    ├── db/
    │   ├── index.ts              # Drizzle client (Supabase PostgreSQL)
    │   ├── schema.ts             # 11 tabel aplikasi
    │   ├── auth-schema.ts        # Better Auth tables (user, session, account, verification)
    │   └── seed.ts               # Admin pertama + sample data
    └── utils.ts                  # getStockStatus(), estimateDaysUntilStockout(), generateCustomId()
```

---

## 4. Environment Variables (PRD Section 21)

```env
DATABASE_URL=                    # Supabase direct connection (port 5432)
NEXT_PUBLIC_SUPABASE_URL=        # https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Service role (server-side only)
GOOGLE_CLIENT_ID=                # OAuth untuk Better Auth Google SSO
GOOGLE_CLIENT_SECRET=
BETTER_AUTH_SECRET=              # JWT signing key
BETTER_AUTH_URL=                 # http://localhost:3000 atau domain prod
GEMINI_API_KEY=                  # Google AI Studio API key
GSHEET_SERVICE_ACCOUNT_KEY=      # JSON blob Service Account (untuk migration)
GSHEET_SPREADSHEET_ID=           # ID spreadsheet GSheet sumber data
NEXT_PUBLIC_APP_URL=             # Base URL deployment
```

---

## 5. Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run db:push      # Push schema ke Supabase (tanpa migrasi file)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Drizzle Studio GUI
npm run db:seed      # Seed admin + sample data
npx tsc --noEmit     # TypeScript check tanpa compile
```

---

## 6. Design System Warna (PRD Section 2.1)

Semua warna diakses via CSS variable `hsl(var(--TOKEN))`:

| Token | Hex | Kegunaan |
|---|---|---|
| `--bg` | `#0A0A0F` | Background halaman |
| `--surface` | `#0F0F18` | Sidebar, topbar, card bg |
| `--card` | `#13131F` | Card konten, modal |
| `--border` | `#1E1E2E` | Border card, divider |
| `--border2` | `#2D2D44` | Border input, hover |
| `--muted` | `#4B5563` | Label sekunder, ID col |
| `--sub` | `#6B7280` | Teks deskripsi, tabel |
| `--text` | `#E2E8F0` | Teks utama |
| `--accent` | `#C8F135` | CTA, active nav, Admin badge |
| `--accentD` | `#86EF3C` | Gradient ujung tombol |
| `--red` | `#EF4444` | CRITICAL, error |
| `--amber` | `#F59E0B` | WARNING, SENT |
| `--green` | `#22C55E` | SAFE, RECEIVED |
| `--blue` | `#60A5FA` | Badge info, detail |

**WAJIB** gunakan token ini, bukan hardcode hex langsung di komponen.

---

## 7. Navigasi (PRD Section 3.2)

| Route | Label | Role |
|---|---|---|
| `/dashboard` | Dashboard | Admin + Manager |
| `/stores` | Stores | Admin + Manager |
| `/products` | Products & Recipes | Admin + Manager |
| `/category` | Assets & Inv. | Admin + Manager |
| `/suppliers` | Suppliers | Admin + Manager |
| `/billing` | Billing | Admin + Manager |
| `/upload-history` | Upload History | Admin + Manager |
| `/po-logs` | PO Logs | Admin + Manager |
| `/delivery` | Delivery | Admin + Manager |
| `/report` | Report | Admin + Manager |
| `/users` | Users | **Admin Only** |
| `/settings` | Settings | **Admin Only** |

---

## 8. PO State Machine

```
draft → sent → received
```
- `draft`: bisa di-edit, dikirim
- `sent`: `tanggal_kirim` diset otomatis, menunggu delivery
- `received`: `tanggal_terima` diset otomatis, stok diperbarui
- Dual template: **Template A** untuk `packaged`, **Template B** untuk `raw_bulk` (+ AI Research panel)

---

## 9. Konvensi Kode

- Setiap halaman: `page.tsx` (Server Component) + `*-client.tsx` (Client Component)
- API auth check: selalu `getSessionUser(request.headers)` — return null jika tidak autentikasi
- Admin-only API: tambah `isAdmin(appUser)` check setelah session check
- Tidak ada `any` type — gunakan type yang tepat atau `unknown`
- ID generation: `generateCustomId("PREFIX", seq)` dari `src/lib/utils.ts`

---

## 10. Exit Criteria (PRD Section 22.2)

| # | Kriteria |
|---|---|
| 1 | Login Better Auth (email+password) berfungsi |
| 2 | Role guard: Manager tidak bisa akses `/users` dan `/settings` |
| 3 | Migration GSheet → Supabase sukses, tombol terkunci permanen |
| 4 | Upload Excel Pawoon berhasil di-parse, `sales_transactions` terisi |
| 5 | Status 3 warna tampil sesuai formula (3 test case PRD Section 19.4) |
| 6 | `avg_daily_consumption` terupdate otomatis setelah upload (mode auto saja) |
| 7 | AI (Gemini) memberikan teks rekomendasi per item sesuai test case |
| 8 | Template PO packaged dan raw/bulk tampil berbeda, panel AI Research muncul |
| 9 | PO status tracking DRAFT→SENT→RECEIVED berfungsi |
| 10 | Admin buat user baru, Credential Card tampil sekali, copy berfungsi |
| 11 | Delete user berfungsi, confirm dialog muncul |
| 12 | PITR aktif di Supabase dashboard (infra task) |

---

*OMNI-STOCK V1.5 · Easy Going Group · Confidential*
