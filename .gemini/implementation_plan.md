# 🏭 TechMicra ERP — Full Analytics + PDF Implementation Plan

**Generated:** 2026-03-07  
**Scope:** Every dashboard page gets: Analytics tab, PDF download, Receipt download (where applicable)

---

## 📋 TABLE OF CONTENTS

1. [Audit Summary](#1-audit-summary)
2. [Shared Infrastructure](#2-shared-infrastructure)
3. [Module A — Masters (5 pages)](#3-module-a--masters)
4. [Module B — HR (4 pages)](#4-module-b--hr)
5. [Module C — Contractors (6 pages)](#5-module-c--contractors)
6. [Module D — Finance (6 pages)](#6-module-d--finance)
7. [Module E — Production (4 pages)](#7-module-e--production)
8. [Module F — Purchase (4 pages)](#8-module-f--purchase)
9. [Module G — Sales (4 pages)](#9-module-g--sales)
10. [Module H — Stores (5 pages)](#10-module-h--stores)
11. [Module I — Maintenance (3 pages)](#11-module-i--maintenance)
12. [Module J — Simulation (1 page)](#12-module-j--simulation)
13. [Execution Order](#13-execution-order)

---

## 1. AUDIT SUMMARY

### All Dashboard Pages (45 data pages across 10 modules)

| # | Module | Page (Route) | Data Source | Has Analytics? | Has PDF? | Is Voucher/Money? |
|---|--------|-------------|-------------|:-:|:-:|:-:|
| 1 | Masters | `/masters/customers` | `actions/customers.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 2 | Masters | `/masters/products` | `actions/products.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 3 | Masters | `/masters/vendors` | `actions/vendors.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 4 | Masters | `/masters/transport` | `actions/transport.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 5 | Masters | `/masters/warehouses` | `actions/warehouses.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 6 | HR | `/hr/employees` | `actions/hr.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 7 | HR | `/hr/salary-heads` | `actions/hr.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 8 | HR | `/hr/salary-sheet` | `actions/hr.ts` (Supabase) | ✅ YES | ✅ Payslip | ✅ YES |
| 9 | HR | `/hr/salary-structure` | `actions/hr.ts` (Supabase) | ✅ YES | ❌ | ❌ |
| 10 | Contractors | `/contractors/workers` | `data/contractorMock.ts` (Mock) | ❌ NEEDS | ❌ | ❌ |
| 11 | Contractors | `/contractors/roles` | `data/contractorMock.ts` (Mock) | ❌ NEEDS | ❌ | ❌ |
| 12 | Contractors | `/contractors/payments` | `data/contractorMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES |
| 13 | Contractors | `/contractors/salary-sheet` | `data/contractorMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES |
| 14 | Contractors | `/contractors/salary-structure` | `data/contractorMock.ts` (Mock) | ❌ NEEDS | ❌ | ❌ |
| 15 | Contractors | `/contractors/advance-memo` | `data/contractorMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES |
| 16 | Finance | `/finance/journal` | `data/financeMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES (Voucher) |
| 17 | Finance | `/finance/payment-receipt` | `data/financeMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES (Voucher+Receipt) |
| 18 | Finance | `/finance/contra` | `data/financeMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES (Voucher) |
| 19 | Finance | `/finance/bank-recon` | `data/financeMock.ts` (Mock) | ❌ NEEDS | ❌ | ❌ |
| 20 | Finance | `/finance/credit-card` | `data/financeMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES |
| 21 | Finance | `/finance/gst-journal` | `data/financeMock.ts` (Mock) | ❌ NEEDS | ❌ | ✅ YES (Voucher) |
| 22 | Production | `/production/bom` | `actions/production.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 23 | Production | `/production/material-issue` | `actions/production.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 24 | Production | `/production/report` | `actions/production.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 25 | Production | `/production/route-card` | `actions/production.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 26 | Purchase | `/purchase/po` | `actions/purchase.ts` (Supabase) | ❌ NEEDS | ❌ | ✅ YES (PO) |
| 27 | Purchase | `/purchase/grn` | `actions/purchase.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 28 | Purchase | `/purchase/iqc` | `actions/purchase.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 29 | Purchase | `/purchase/billbook` | `actions/purchase.ts` (Supabase) | ❌ NEEDS | ❌ | ✅ YES (Bill) |
| 30 | Sales | `/sales/inquiry` | `actions/inquiries.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 31 | Sales | `/sales/sale-order` | `actions/saleOrders.ts` (Supabase) | ❌ NEEDS | ❌ | ✅ YES (SO) |
| 32 | Sales | `/sales/invoice` | `actions/invoices.ts` (Supabase) | ❌ NEEDS | ❌ | ✅ YES (Invoice) |
| 33 | Sales | `/sales/collections` | `actions/receiptVouchers.ts` (Supabase) | ❌ NEEDS | ❌ | ✅ YES (Receipt) |
| 34 | Stores | `/stores/dispatch-srv` | `actions/stores.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 35 | Stores | `/stores/material-receipt` | `actions/stores.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 36 | Stores | `/stores/opening-stock` | `actions/stores.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 37 | Stores | `/stores/stock-transfer` | `actions/stores.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 38 | Stores | `/stores/warehouse-master` | `actions/stores.ts` (Supabase) | ❌ NEEDS | ❌ | ❌ |
| 39 | Maintenance | `/maintenance/tool-master` | `actions/maintenance` (Supabase) | ✅ YES | ❌ | ❌ |
| 40 | Maintenance | `/maintenance/calibration` | `actions/maintenance` (Supabase) | ✅ YES | ❌ | ❌ |
| 41 | Maintenance | `/maintenance/rectification` | `actions/maintenance` (Supabase) | ✅ YES | ❌ | ❌ |
| 42 | Simulation | `/simulation` | N/A (Calculated) | ❌ SKIP* | ❌ | ❌ |

**\* Simulation** is a calculator/forecasting tool — not a data dashboard. Does not need analytics/PDF.

### Summary Counts
- **Pages needing new Analytics tab:** 22 pages (across Contractors, Finance, Production, Purchase, Sales, Stores)
- **Pages already having Analytics:** 12 pages (Masters 5, HR 4, Maintenance 3)
- **Pages needing list PDF download:** All 41 data pages
- **Pages needing voucher/receipt PDF:** 14 pages (money/transaction related)
- **Pages needing analysis report PDF export:** All 34 analytics pages (12 existing + 22 new)

---

## 2. SHARED INFRASTRUCTURE (Build First)

### 2A. Client-Side PDF Download Utility
**File:** `src/lib/pdf/downloadPdf.ts`

Purpose: A reusable client-side utility for generating & downloading PDFs from data using the browser.

**Approach:** Use `window.print()` with a hidden iframe styled for print, OR use `jspdf` + `jspdf-autotable` for structured PDFs. 

**Decision:** Use **`jspdf` + `jspdf-autotable`** for programmatic table-based PDFs (list pages, vouchers) and **`html2canvas` + `jspdf`** for analytics chart pages.

**Install required:**
```bash
npm install jspdf jspdf-autotable html2canvas
```

**Files to create:**
| File | Purpose |
|------|---------|
| `src/lib/pdf/downloadPdf.ts` | Core utility: `downloadTablePdf(title, columns, rows, options)` |
| `src/lib/pdf/downloadVoucherPdf.ts` | Voucher/Receipt PDF: `downloadVoucherPdf(voucherData)` |
| `src/lib/pdf/downloadAnalysisPdf.ts` | Analytics screenshots: `downloadAnalysisPdf(containerRef, title)` |

### 2B. PDF Styling Constants
**File:** `src/lib/pdf/pdfConstants.ts`

```
- Company branding (name, address, GSTIN, logo placeholder)
- Standard header/footer layout
- Color scheme for tables
- Font sizes, margins
- Page size (A4)
```

### 2C. Reusable "Download" Button Component
**File:** `src/components/ui/DownloadButton.tsx`

A styled button with an icon that triggers PDF download. Variants:
- `list` — Downloads data table as PDF
- `voucher` — Downloads voucher/receipt
- `analytics` — Downloads analytics charts as PDF report

---

## 3. MODULE A — MASTERS (5 pages) ⬜ Already have analytics

### Status: Analytics ✅ exists for all 5. Needs: PDF download + Analytics export.

### For each page (Customers, Products, Vendors, Transport, Warehouses):

#### 3A. List Page — Add "Download PDF" button
Add a download button in the header of each list component:
- **CustomerList.tsx** → Download customer list as table PDF
- **ProductList.tsx** → Download product catalogue PDF
- **VendorList.tsx** → Download vendor directory PDF
- **TransportList.tsx** → Download transport list PDF
- **WarehouseList.tsx** → Download warehouse list PDF

**PDF Structure:** Standard table with company header, page title, date, column headers, rows, page numbers.

#### 3B. Analytics Page — Add "Export Report PDF" button
For each existing analytics component:
- **CustomerAnalytics.tsx** → Capture charts + KPIs as report PDF
- **ProductAnalytics.tsx** → Capture charts + KPIs as report PDF
- **VendorAnalytics.tsx** → Report PDF
- **TransportAnalytics.tsx** → Report PDF
- **WarehouseAnalytics.tsx** → Report PDF

---

## 4. MODULE B — HR (4 pages) ⬜ Already have analytics

### Status: Analytics ✅ exists for all 4. Needs: PDF download + Analytics export.

| Page | List PDF | Voucher/Receipt PDF | Analytics Export |
|------|----------|-------------------|-----------------|
| Employees | Employee roster PDF | ❌ | ✅ Report PDF |
| Salary Heads | Salary component list PDF | ❌ | ✅ Report PDF |
| Salary Sheets | Salary sheet summary PDF | ✅ Payslip already exists | ✅ Report PDF |
| Salary Structure | Structure summary PDF | ❌ | ✅ Report PDF |

---

## 5. MODULE C — CONTRACTORS (6 pages) 🔴 Needs everything

### Data Source: `data/contractorMock.ts` (client-side mock)

**Important:** All contractor pages use mock data, so analytics components will be `'use client'` and receive data as props from the page itself (no server fetch needed).

### 5.1 Workers (`/contractors/workers`)
**Content:** Worker list with name, firm, Aadhar, mobile, bank details, status
**Analytics Tab Charts:**
- Workers by Firm (Pie)
- Active vs Inactive (Donut)
- Workers by Bank (Bar)
- Worker summary table
**PDF:** Worker register PDF
**Receipt:** ❌

### 5.2 Roles (`/contractors/roles`)
**Content:** Role master with name, description, daily rate
**Analytics Tab Charts:**
- Roles by daily rate range (Bar)
- Role rate comparison (Horizontal Bar)
- All roles summary table
**PDF:** Role rate card PDF
**Receipt:** ❌

### 5.3 Payments (`/contractors/payments`)
**Content:** Payment list with firm, amount, date, status, mode
**Analytics Tab Charts:**
- Payments by firm (Pie)
- Monthly payment trend (Line)
- Payment mode distribution (Donut)
- Status breakdown (Bar)
- Payment summary table
**PDF:** Payment register PDF
**Receipt:** ✅ Payment voucher PDF per row

### 5.4 Salary Sheet (`/contractors/salary-sheet`)
**Content:** Sheet with worker, month, year, days, daily rate, gross, deductions, net pay, status
**Analytics Tab Charts:**
- Monthly payroll trend (Composed: Area + Line)
- Salary by firm (Bar)
- Status distribution (Donut)
- Top earners (Horizontal Bar)
- Payroll summary table
**PDF:** Payroll register PDF
**Receipt:** ✅ Contractor payslip per row

### 5.5 Salary Structure (`/contractors/salary-structure`)
**Content:** Structure with worker, role, daily rate, OT rate, deductions
**Analytics Tab Charts:**
- Rate distribution (Bar)
- Structure by role (Grouped Bar)
- Coverage: Configured vs missing (Donut)
- Structure summary table
**PDF:** Structure list PDF
**Receipt:** ❌

### 5.6 Advance Memo (`/contractors/advance-memo`)
**Content:** Advance with firm, worker, amount, date, status, purpose
**Analytics Tab Charts:**
- Advances by firm (Pie)
- Monthly advance trend (Line)
- Status distribution (Donut)
- Advance summary table
**PDF:** Advance register PDF
**Receipt:** ✅ Advance receipt per row

---

## 6. MODULE D — FINANCE (6 pages) 🔴 Needs everything

### Data Source: `data/financeMock.ts` (client-side mock)

### 6.1 Journal (`/finance/journal`)
**Content:** Journal entries with voucher no, date, debit/credit account, narration, amount
**Analytics Tab Charts:**
- Monthly journal volume (Line)
- Amount distribution by account (Bar)
- Top accounts by flow (Horizontal Bar)
- Journal register summary table
**PDF:** Journal register PDF
**Receipt:** ✅ Journal voucher PDF per entry

### 6.2 Payment & Receipt (`/finance/payment-receipt`)
**Content:** Payments/receipts with voucher no, type, date, party, mode, narration, amount
**Analytics Tab Charts:**
- Payment vs Receipt volume (Stacked Bar)
- Monthly cashflow trend (Composed)
- Mode distribution (Donut)
- Top parties by amount (Horizontal Bar)
- Transaction register table
**PDF:** Transaction register PDF
**Receipt:** ✅ Payment/Receipt voucher PDF per entry

### 6.3 Contra (`/finance/contra`)
**Content:** Contra with voucher no, date, from/to account, narration, amount
**Analytics Tab Charts:**
- Monthly contra volume (Bar)
- Account corridor flow (Bar showing from → to)
- Contra summary table
**PDF:** Contra register PDF
**Receipt:** ✅ Contra voucher PDF per entry

### 6.4 Bank Reconciliation (`/finance/bank-recon`)
**Content:** Recon lines with bank account, date, status, system/bank balance, unreconciled amount
**Analytics Tab Charts:**
- Reconciliation status (Donut)
- Unreconciled amounts by bank (Bar)
- System vs Bank balance comparison (Grouped Bar)
- Recon summary table
**PDF:** Reconciliation statement PDF
**Receipt:** ❌

### 6.5 Credit Card (`/finance/credit-card`)
**Content:** CC transactions with card no, merchant, statement month, date, expense head, amount
**Analytics Tab Charts:**
- Spending by expense head (Pie)
- Monthly spending trend (Line)
- Top merchants (Horizontal Bar)
- Card utilization summary
**PDF:** CC statement PDF
**Receipt:** ✅ CC expense receipt per transaction

### 6.6 GST Journal (`/finance/gst-journal`)
**Content:** GST entries with voucher no, date, adjustment type, narration, amount
**Analytics Tab Charts:**
- Adjustment type distribution (Pie)
- Monthly GST adjustment trend (Bar)
- Amount by type (Grouped Bar)
- GST summary table
**PDF:** GST register PDF
**Receipt:** ✅ GST voucher PDF per entry

---

## 7. MODULE E — PRODUCTION (4 pages) 🔴 Needs everything

### Data Source: `actions/production.ts` (Supabase)

### 7.1 BOM (`/production/bom`)
**Content:** Bills of Materials with product, version, items, quantities, unit costs
**Analytics Tab Charts:**
- BOMs by product (Bar)
- Material cost distribution (Pie)
- Top costliest BOMs (Horizontal Bar)
- BOM component count distribution (Bar)
- BOM summary table
**PDF:** BOM register PDF
**Receipt:** ❌

### 7.2 Material Issue (`/production/material-issue`)
**Content:** Issues with issue no, date, product, warehouse, items, quantities
**Analytics Tab Charts:**
- Issues by month (Bar)
- Material usage by product (Pie)
- Top issued materials (Horizontal Bar)
- Warehouse utilization (Donut)
- Issue summary table
**PDF:** Material issue register PDF
**Receipt:** ❌

### 7.3 Production Report (`/production/report`)
**Content:** Reports with product, quantity produced, date, shift, yield, defects
**Analytics Tab Charts:**
- Monthly production volume (Line)
- Product-wise output (Bar)
- Yield rate trend (Line)
- Defect rate analysis (Bar)
- Shift-wise production (Stacked Bar)
- Production summary table
**PDF:** Production report PDF
**Receipt:** ❌

### 7.4 Route Card (`/production/route-card`)
**Content:** Route cards with card no, product, operations, status, dates
**Analytics Tab Charts:**
- Status distribution (Donut)
- Cards by product (Bar)
- Monthly card volume (Line)
- Operation completion rate (Health bars)
- Route card summary table
**PDF:** Route card register PDF
**Receipt:** ❌

---

## 8. MODULE F — PURCHASE (4 pages) 🔴 Needs everything

### Data Source: `actions/purchase.ts` (Supabase)

### 8.1 Purchase Orders (`/purchase/po`)
**Content:** POs with PO no, vendor, date, items, amounts, status, delivery date
**Analytics Tab Charts:**
- Monthly PO volume & value (Composed)
- Top vendors by value (Horizontal Bar)
- PO status distribution (Donut)
- Item-wise spend breakdown (Pie)
- PO summary table
**PDF:** PO register PDF
**Receipt:** ✅ Purchase Order PDF per row

### 8.2 GRN (`/purchase/grn`)
**Content:** GRNs with GRN no, PO ref, vendor, date, items received, qty, status
**Analytics Tab Charts:**
- Monthly GRN volume (Bar)
- Vendor-wise receiving (Pie)
- GRN completion rate (Health bars)
- Qty ordered vs received (Grouped Bar)
- GRN summary table
**PDF:** GRN register PDF
**Receipt:** ❌

### 8.3 IQC (`/purchase/iqc`)
**Content:** IQC entries with entry no, GRN ref, product, qty, result (Pass/Fail/Partial), remarks
**Analytics Tab Charts:**
- Pass/Fail/Partial distribution (Donut)
- Monthly IQC volume (Bar)
- Rejection rate trend (Line)
- Product-wise quality (Horizontal Bar)
- IQC summary table
**PDF:** IQC report PDF
**Receipt:** ❌

### 8.4 Purchase Bills (`/purchase/billbook`)
**Content:** Bills with bill no, vendor, date, items, GST, amount, payment status
**Analytics Tab Charts:**
- Monthly bill volume & value (Composed)
- Vendor-wise bills (Pie)
- Payment status distribution (Donut)
- GST collected analysis (Bar)
- Top bills by amount (Horizontal Bar)
- Bill summary table
**PDF:** Bill register PDF
**Receipt:** ✅ Purchase bill PDF per row

---

## 9. MODULE G — SALES (4 pages) 🔴 Needs everything

### Data Source: `actions/inquiries.ts`, `actions/saleOrders.ts`, `actions/invoices.ts`, `actions/receiptVouchers.ts` (Supabase)

### 9.1 Inquiries (`/sales/inquiry`)
**Content:** Inquiries with inquiry no, customer, date, products, status, remarks
**Analytics Tab Charts:**
- Monthly inquiry volume (Line)
- Status distribution (Donut) — Open/Converted/Lost
- Customer-wise inquiries (Bar)
- Product interest heatmap (Horizontal Bar)
- Conversion funnel (Funnel/Stacked Bar)
- Inquiry summary table
**PDF:** Inquiry register PDF
**Receipt:** ❌

### 9.2 Sale Orders (`/sales/sale-order`)
**Content:** SOs with SO no, customer, date, items, amounts, status
**Analytics Tab Charts:**
- Monthly SO volume & value (Composed)
- Customer-wise orders (Pie)
- SO status distribution (Donut)
- Top products ordered (Horizontal Bar)
- SO summary table
**PDF:** SO register PDF
**Receipt:** ✅ Sale Order PDF per row

### 9.3 Invoices (`/sales/invoice`)
**Content:** Invoices with invoice no, customer, date, items, GST, amounts, status
**Analytics Tab Charts:**
- Monthly revenue trend (Line)
- Customer-wise revenue (Pie)
- GST collection analysis (Bar)
- Invoice status distribution (Donut) — Paid/Pending/Overdue
- Top invoices by amount (Horizontal Bar)
- Invoice summary table
**PDF:** Invoice register PDF
**Receipt:** ✅ Tax Invoice PDF per row

### 9.4 Collections (`/sales/collections`)
**Content:** Receipt vouchers with voucher no, customer, date, amount, mode, reference
**Analytics Tab Charts:**
- Monthly collection trend (Line)
- Collection by mode (Donut)
- Customer-wise collection (Bar)
- Outstanding analysis (Health bars)
- Collection summary table
**PDF:** Collection register PDF
**Receipt:** ✅ Receipt voucher PDF per row

---

## 10. MODULE H — STORES (5 pages) ✅ Done

### Data Source: `actions/stores.ts` (Supabase)

### 10.1 Dispatch SRV (`/stores/dispatch-srv`)
**Content:** SRVs with SRV no, customer, date, items, quantities, warehouse, status
**Analytics Tab Charts:**
- Monthly dispatch volume (Bar)
- Customer-wise dispatch (Pie)
- Warehouse utilization (Donut)
- Status distribution (Bar)
- Dispatch summary table
**PDF:** Dispatch register PDF
**Receipt:** ❌

### 10.2 Material Receipt (`/stores/material-receipt`)
**Content:** Receipts with receipt no, vendor, date, items, quantities, warehouse
**Analytics Tab Charts:**
- Monthly receipt volume (Bar)
- Vendor-wise receipts (Pie)
- Warehouse-wise receiving (Donut)
- Receipt summary table
**PDF:** Receipt register PDF
**Receipt:** ❌

### 10.3 Opening Stock (`/stores/opening-stock`)
**Content:** Stock entries with product, warehouse, qty, value, date
**Analytics Tab Charts:**
- Stock value by warehouse (Bar)
- Product-wise stock distribution (Pie)
- Stock value summary
**PDF:** Opening stock statement PDF
**Receipt:** ❌

### 10.4 Stock Transfer (`/stores/stock-transfer`)
**Content:** Transfers with ref no, from/to warehouse, products, qty, date, status
**Analytics Tab Charts:**
- Monthly transfer volume (Line)
- Warehouse flow analysis (Horizontal Bar)
- Status distribution (Donut)
- Top transferred products (Bar)
- Transfer summary table
**PDF:** Transfer register PDF
**Receipt:** ❌

### 10.5 Warehouse Master (`/stores/warehouse-master`)
**Content:** Warehouses with name, type, location, capacity
**Analytics Tab Charts:**
- Warehouse by type (Pie)
- Capacity comparison (Bar)
- Warehouse summary table
**PDF:** Warehouse directory PDF
**Receipt:** ❌

---

## 11. MODULE I — MAINTENANCE (3 pages) ⬜ Already have analytics

### Status: Analytics ✅ exists for all 3. Needs: PDF download + Analytics export.

| Page | List PDF | Receipt PDF | Analytics Export |
|------|----------|------------|-----------------|
| Tool Master | Tool register PDF | ❌ | ✅ Report PDF |
| Calibration | Calibration schedule PDF | ❌ | ✅ Report PDF |
| Rectification | Rectification log PDF | ❌ | ✅ Report PDF |

---

## 12. MODULE J — SIMULATION (1 page) ⏭️ SKIP

The simulation page is a forecasting calculator, not a data dashboard. It already generates results on-the-fly. **No analytics tab or PDF needed.**

---

## 13. EXECUTION ORDER

### Phase 1: Shared Infrastructure (Do first)
```
1.1  npm install jspdf jspdf-autotable html2canvas
1.2  Create src/lib/pdf/pdfConstants.ts
1.3  Create src/lib/pdf/downloadTablePdf.ts
1.4  Create src/lib/pdf/downloadVoucherPdf.ts  
1.5  Create src/lib/pdf/downloadAnalysisPdf.ts
1.6  Create src/components/ui/DownloadButton.tsx
```

### Phase 2: Add PDF Downloads to ALL existing pages (12+22=34 analytics + 41 list pages)
```
For each module (Masters → HR → Maintenance → others):
  2.a  Add "📄 Download PDF" button to list component header
  2.b  Wire download function with column mapping
  2.c  For voucher/money pages: Add per-row "Download" action button
  2.d  Add "Export Report" button to each analytics page
```

### Phase 3: Build NEW Analytics Tabs (22 pages)
```
For each module needing analytics (Contractors → Finance → Production → Purchase → Sales → Stores):
  3.a  Create XxxAnalytics.tsx component (with charts, KPIs, tabs, tables)
  3.b  Create analytics/page.tsx route 
  3.c  Add "◎ Analytics" button to list component header
  3.d  Add "Export Report PDF" to new analytics component  
```

### Phase 4: Build Voucher/Receipt PDFs (14 pages)
```
For each money-related page:
  4.a  Define voucher data mapping
  4.b  Add per-row "Download Voucher/Receipt" button
  4.c  Wire to downloadVoucherPdf utility
```

---

## ⚡ KEY DECISIONS

1. **PDF Library:** `jspdf` + `jspdf-autotable` for programmatic PDFs (tables, vouchers). `html2canvas` + `jspdf` for analytics page screenshots.
2. **Chart Library:** Continue using `recharts` (already installed) for all analytics.
3. **Styling:** Reuse existing `MasterAnalytics.module.scss` / `CustomerAnalytics.module.scss` for all analytics components.
4. **Mock vs Supabase:** Finance & Contractor modules use mock data — analytics components will be `'use client'` and handle data internally. Production, Purchase, Sales, Stores use Supabase — analytics route pages will be server components that fetch data.
5. **Voucher PDF Format:** Standard Indian voucher format with company header, voucher details, amount in words, signatures area. Consistent across all modules.

---

## 📊 TOTAL DELIVERABLES COUNT

| Category | Count |
|----------|-------|
| New analytics components | 22 |
| New analytics route pages | 22 |
| Analytics buttons added to list headers | 22 |
| Shared PDF utilities | 4 files |
| Download button component | 1 |
| List page PDF downloads added | 41 pages |
| Analytics report PDF exports | 34 pages |
| Voucher/receipt per-row PDFs | 14 pages |
| **TOTAL FILES CREATED/MODIFIED** | **~136** |
