# OMNI-STOCK V1.5 Phase 1 - Implementation Checklist

## Current Status: 15% Complete
Last Updated: March 11, 2026

---

## ✅ COMPLETED

### Infrastructure
- [x] Next.js 15 App Router setup
- [x] Supabase PostgreSQL database
- [x] Drizzle ORM configured
- [x] Better Auth library installed
- [x] Tailwind CSS + shadcn/ui
- [x] Basic folder structure

---

## 🔧 IN PROGRESS

### Database Schema Fixes (Priority 1)
- [ ] Remove `stok_saat_ini` from master_bahan (violates PRD - stock is transient)
- [ ] Add `password_hash` to users table
- [ ] Add `must_change_password` to users table
- [ ] Add `outlet_id` to users table
- [ ] Add `kategori` enum to master_menu ('food' | 'beverage')
- [ ] Rename `kontak` to `kontak_wa` in master_vendor
- [ ] Add `outlet_id` to master_menu table
- [ ] Verify all ID formats match PRD (USR-xxx, BHN-xxx, etc.)

---

## 📋 PENDING TASKS

### Phase 1: Design System (Week 1)
- [ ] Update globals.css with exact PRD color tokens
  - bg: #0A0A0F
  - surface: #0F0F18
  - card: #13131F
  - border: #1E1E2E
  - border2: #2D2D44
  - accent: #C8F135
  - accentD: #86EF3C
  - All status colors (red, amber, green, blue)
- [ ] Configure DM Sans font (fallback Arial)
- [ ] Create reusable component variants (Button, Badge, Card, etc.)

### Phase 2: Authentication & Shell (Week 1-2)
- [ ] Better Auth configuration
  - Email + password credential provider
  - Session management (JWT 7 days)
  - Role-based middleware
- [ ] Login page (/login)
  - 3-tab role selector (STAFF/SPV/MANAGER)
  - Email + password fields with toggle
  - Loading states
  - Error handling
  - Blob decorations
- [ ] Shell Layout
  - Sidebar (220px expanded / 58px collapsed)
  - Topbar (52px height)
  - Navigation structure (12 routes)
  - Admin-only badge for Users & Settings
  - User pill at bottom
- [ ] Middleware role guards
  - Redirect manager from /users and /settings

### Phase 3: Dashboard Core (Week 2-3)
- [ ] Smart Batch Uploader
  - Drop zone with drag & drop
  - .xls/.xlsx file parsing (SheetJS)
  - Parse Pawoon stock card format
  - Update sales_transactions table
  - Calculate avg_daily_consumption
  - Transient stock state management
- [ ] 4 Stat Cards
  - Total Products
  - Available Stocks (SAFE)
  - Warning + Critical
  - Out of Stocks (CRITICAL)
- [ ] 4 Widget Cards (2x2 grid)
  - Top Contributors
  - Audit Pengeluaran
  - Smart Stock Warning
  - AI Predictive Restock (Gemini)
- [ ] Main Inventory Table
  - 9 columns with exact PRD specs
  - Real-time search
  - 3-color status badges
  - "Rancang PO" buttons for WARNING/CRITICAL
- [ ] PO Cart Sidebar (300px)
  - Add/remove items
  - Qty input per item
  - AI Research panel for raw_bulk
  - "Buat Draft PO" CTA
- [ ] PO Logs Section
  - Filter tabs (Semua/DRAFT/SENT/RECEIVED)
  - 7 columns
  - Detail modal

### Phase 4: Products & Recipes (Week 3-4)
- [ ] Tab Selector (3 tabs)
- [ ] Tab 1: Master Bahan
  - Table with 9 columns
  - Add/Edit modal
  - Search functionality
- [ ] Tab 2: Master Resep (BOM)
  - Komposisi chips display
  - Total COGS calculation
- [ ] Tab 3: Master Menu
  - Recipe overview badges
  - Edit Resep modal
- [ ] Multi-Level BOM Editor Modal
  - Select Tipe (Bahan/Sub-Resep)
  - Dynamic item dropdown
  - Real-time COGS calculation
  - Add/remove rows

### Phase 5: Suppliers (Week 4)
- [ ] List View
  - 3 stat cards
  - Vendor table (7 columns)
  - Add Vendor modal
- [ ] Detail View (drill-down)
  - Back button navigation
  - 4 info cards
  - 2 stat cards
  - Purchase Orders table

### Phase 6: Supporting Pages (Week 5)
- [ ] Stores (/stores)
  - 4 stat cards
  - Upload Compliance tab
  - Menu Profitability Matrix tab
- [ ] Assets & Inventory (/category)
  - 3 tabs: Barang Habis Pakai, Aset Tetap, Mutasi
  - Add/Edit modals per tab
- [ ] Billing (/billing)
  - 4 stat cards
  - Invoice table with filters
  - "Tandai Lunas" action
- [ ] Delivery (/delivery)
  - 3 stat cards
  - Tracking table
  - Konfirmasi Terima action
- [ ] Upload History (/upload-history)
  - Audit trail table
  - Status badges
- [ ] Report (/report)
  - 4 stat cards
  - 12-month bar chart
  - Top 5 Bahan
  - Vendor Performance table

### Phase 7: Admin Pages (Week 5-6)
- [ ] Users (/users) - Admin Only
  - 3 stat cards
  - User table with avatar + badges
  - Add User flow
    - Form with auto-generated password
    - Credential Card (one-time display)
    - Copy All functionality
  - Delete User flow
  - Server-side role check
- [ ] Settings (/settings) - Admin Only
  - One-Way Migration card (with lock)
  - Supabase PITR info
  - Better Auth info
  - System Info

### Phase 8: Integrations (Week 6)
- [ ] Google Sheets One-Way Migration
  - Service Account auth
  - Atomic transaction
  - Lock mechanism (system_configs)
  - Parse outlets, pawoon_products, mapping_pawoon
- [ ] Gemini AI Integration
  - Packaged template prompt
  - Raw/Bulk template prompt
  - Market price research
  - Yield estimation
  - Store in purchase_orders.ai_notes

### Phase 9: Business Logic (Week 6-7)
- [ ] 3-Color Status Calculation
  - Server-side formula
  - SAFE: stok > (min + (lead_time × avg_consumption))
  - WARNING: stok ≤ (min + (lead_time × avg_consumption))
  - CRITICAL: stok ≤ min
- [ ] avg_daily_consumption Auto-Update
  - Calculate from sales_transactions
  - Update after each upload
  - Source tracking (manual vs auto)
- [ ] PO Status Workflow
  - DRAFT → SENT (tanggal_kirim timestamp)
  - SENT → RECEIVED (tanggal_terima timestamp)
  - Update stock on RECEIVED
- [ ] COGS Calculation
  - Recursive BOM resolution (2 levels)
  - Auto-update on recipe changes

### Phase 10: QA & Testing (Week 7)
- [ ] Exit Criteria Testing
  1. Login Better Auth works
  2. Role guard: Manager blocked from /users & /settings
  3. Migration lock works permanently
  4. Excel upload parses correctly
  5. 3-color status displays correctly (3 test cases)
  6. avg_daily_consumption updates after upload
  7. AI Gemini gives recommendations (3 test cases)
  8. PO templates differ (packaged vs raw_bulk)
  9. PO status tracking works, stock updates on RECEIVED
  10. Add User + Credential Card works
  11. Delete User works with confirmation
  12. PITR enabled in Supabase dashboard

---

## 🚨 CRITICAL BLOCKERS

1. **Schema must be fixed FIRST** - Current schema violates PRD
2. **No stok_saat_ini column** - Stock is transient from uploads only
3. **Better Auth fields missing** - Can't implement login without password_hash

---

## 📊 PROGRESS METRICS

- **Overall**: 15%
- **Database Schema**: 70% (needs fixes)
- **Design System**: 0%
- **Authentication**: 30% (library installed, not configured)
- **Dashboard**: 10% (basic structure only)
- **Other Pages**: 0%

---

## 🎯 NEXT IMMEDIATE STEPS

1. Fix database schema (remove stok_saat_ini, add missing fields)
2. Push schema changes to Supabase
3. Update globals.css with PRD color tokens
4. Implement Better Auth configuration
5. Build login page
6. Build shell layout (Sidebar + Topbar)

---

## 📝 NOTES

- All IDs use custom format (PREFIX-###), not UUID
- Stock is NEVER stored in master_bahan - only from upload sessions
- AI recommendations stored in purchase_orders.ai_notes
- Migration button locks permanently after first run
- Better Auth handles both Google SSO and email/password
