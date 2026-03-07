# TechMicra ERP

A full-stack Enterprise Resource Planning (ERP) web application built for TechMicra. Covers the complete business workflow from sales and purchase through production, finance, HR, quality, stores, logistics, and statutory compliance.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, SCSS Modules |
| Backend | Supabase (PostgreSQL), Next.js Server Actions |
| Auth | Supabase Auth + custom users/roles tables |
| Styling | SCSS Modules, dark theme with CSS variables |
| Hosting | Vercel (frontend), Supabase (database) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- npm or yarn

### Installation

```bash
git clone https://github.com/your-org/techmicra-erp.git
cd techmicra-erp
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SCHEDULER_SECRET=your_random_secret_string

# Uncomment when subscriptions are available:
# RESEND_API_KEY=re_xxxxxxxxxxxx
# WATI_API_KEY=your_wati_token
# TWILIO_SID=ACxxxxxxxxxxxx
# TWILIO_TOKEN=your_twilio_token
```

### Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions (DB queries, mutations)
│   ├── api/              # API routes (scheduler etc.)
│   └── dashboard/        # All ERP pages
│       ├── masters/
│       ├── sales/
│       ├── purchase/
│       ├── production/
│       ├── finance/
│       ├── hr/
│       ├── stores/
│       ├── logistics/
│       ├── quality/
│       └── ...
├── components/
│   ├── modules/          # Feature-specific components
│   │   ├── masters/
│   │   ├── sales/
│   │   ├── purchase/
│   │   └── production/
│   └── ui/               # Shared UI components (Card, Table, Badge, Button)
├── constants/
│   └── permissions.ts    # MODULES, PAGES constants + Permission type
├── lib/
│   ├── supabase/         # Supabase client (server + browser)
│   ├── permissions.ts    # Client-side permission helpers
│   ├── reminderMessages.ts
│   └── notificationDispatcher.ts
├── styles/
│   └── globals.scss      # CSS variables, dark theme
├── types/                # TypeScript types per module
└── proxy.ts              # Next.js middleware (auth + RBAC)
```

---

## Modules

### Masters
| Page | Path |
|---|---|
| Customers | `/dashboard/masters/customers` |
| Vendors | `/dashboard/masters/vendors` |
| Products | `/dashboard/masters/products` |
| Warehouses | `/dashboard/masters/warehouses` |
| Transport | `/dashboard/masters/transport` |

### Sales
| Page | Path |
|---|---|
| Inquiry | `/dashboard/sales/inquiry` |
| Sale Order | `/dashboard/sales/sale-order` |
| Invoice | `/dashboard/sales/invoice` |
| Collections | `/dashboard/sales/collections` |
| Payment Reminders | `/dashboard/sales/reminders` |

### Purchase
| Page | Path |
|---|---|
| Purchase Orders | `/dashboard/purchase/po` |
| GRN | `/dashboard/purchase/grn` |
| IQC | `/dashboard/purchase/iqc` |
| Billbook | `/dashboard/purchase/billbook` |

### Production
| Page | Path |
|---|---|
| Bill of Materials | `/dashboard/production/bom` |
| Route Cards | `/dashboard/production/route-card` |
| Material Issue | `/dashboard/production/material-issue` |
| Production Report | `/dashboard/production/report` |

### Finance, HR, Quality, Stores, Logistics, Statutory
Built by teammates — refer to their module documentation.

---

## Authentication & RBAC

### How Auth Works
1. User logs in via Supabase Auth (`/login`)
2. `getSessionUser()` fetches the user row from `public.users` by email
3. Role is fetched from `public.roles` separately
4. Permissions are loaded from `public.permissions` for that role

### Roles

| Role | Description |
|---|---|
| Super Admin | Full access to everything, bypasses all permission checks |
| Sales Manager | Full access to Sales module, view-only on Masters and Logistics |
| Purchase Manager | Full access to Purchase, view-only on relevant Masters and Stores |
| Production Manager | Full access to Production, view-only on Masters and Stores |
| HR Manager | Full access to HR module |
| Finance Manager | Full access to Finance, view-only on Sales invoices and Purchase bills |
| Warehouse Manager | Full access to Stores, view-only on relevant modules |
| Viewer | View-only access across all modules |

### How Permissions Work
- Permissions are stored in `public.permissions` with `module`, `page`, `can_view`, `can_create`, `can_edit`, `can_delete` (smallint 0/1)
- Middleware (`proxy.ts`) checks `can_view` on every page load and redirects to `/dashboard/unauthorized` if denied
- Sidebar filters nav items based on the user's permission set — inaccessible pages are hidden entirely
- Super Admins bypass all permission checks via `is_super_admin` flag on the roles table

### Test Users

| Name | Email | Password | Role |
|---|---|---|---|
| Raj Mehta | raj@techmicra.com | admin | Super Admin |
| Priya Shah | priya@techmicra.com | sales | Sales Manager |
| Arjun Patel | arjun@techmicra.com | purchase | Purchase Manager |
| Vikram Joshi | vikram@techmicra.com | production | Production Manager |
| Neha Desai | neha@techmicra.com | hr | HR Manager |
| Amit Kapoor | amit@techmicra.com | finance | Finance Manager |
| Ravi Kumar | ravi@techmicra.com | warehouse | Warehouse Manager |
| Sneha Iyer | sneha@techmicra.com | viewer | Viewer |

---

## Database

### Key Tables

| Table | Description |
|---|---|
| `users` | App users with role assignment |
| `roles` | Role definitions with `is_super_admin` flag |
| `permissions` | Page-level access per role |
| `customers` | Customer master |
| `vendors` | Vendor master |
| `products` | Product master with stock levels |
| `warehouses` | Warehouse master |
| `transport_masters` | Transporter master |
| `inquiries` + `inquiry_items` | Sales inquiries |
| `sale_orders` + `sale_order_items` | Sale orders |
| `invoices` + `invoice_items` | Sales invoices |
| `receipt_vouchers` | Payment receipts from customers |
| `reminder_configs` | Per-customer reminder settings |
| `reminder_logs` | Communication history for payment reminders |
| `purchase_orders` + `po_items` | Purchase orders |
| `grns` + `grn_items` | Goods receipt notes |
| `iqc_entries` | Incoming quality control |
| `purchase_bills` | Vendor invoices |
| `bom_headers` + `bom_items` | Bill of materials |
| `route_cards` | Production batch tracking |
| `material_issues` | Raw material issued to production floor |
| `production_reports` | Daily production output log |

### RLS
Row Level Security is currently **disabled** on all tables. RLS policies are planned before production deployment.

---

## Payment Reminder System

An automated background job system that monitors unpaid invoices and sends reminders.

### How It Works
1. Each customer can have a `reminder_config` (enabled/disabled, mode, contact details)
2. The scheduler runs daily via `POST /api/scheduler/reminders`
3. It checks all unpaid invoices against today's date and fires the appropriate trigger
4. Every notification attempt is logged in `reminder_logs`

### Reminder Modes
| Mode | Triggers |
|---|---|
| Strict | T-7, T-3, T-0, Daily overdue |
| Moderate | T-3, T-0, Daily overdue |
| Lenient | T-0, Daily overdue |

### Notification Channels
- **Email** — via Resend (currently mocked, activate by uncommenting in `notificationDispatcher.ts`)
- **WhatsApp** — via WATI or Twilio (currently mocked, activate when subscription available)

### Manual Trigger
Hit the **"Run Scheduler Now"** button on `/dashboard/sales/reminders` or call:
```
GET /api/scheduler/reminders
Authorization: Bearer your_scheduler_secret
```

---

## Cross-Module Business Logic

| Trigger | Action |
|---|---|
| Receipt Voucher created | Auto-updates `invoices.payment_status` to Partial or Paid |
| IQC entry created | Updates `grns.status` → IQC Done |
| Purchase Bill created | Updates `grns.status` → Received |
| Material Issue created | Updates `route_cards.status` → In Progress |
| Production Report created | Adds to `route_cards.produced_qty`, auto-closes when plan qty reached |

### Pending DB Triggers (to be implemented)
- `sale_order_items` INSERT/DELETE → update `products.current_stock`
- `grn_items` INSERT → update `products.current_stock`
- `material_issues` INSERT → decrease `products.current_stock`
- `invoices` INSERT → update `sale_orders.status` → Dispatched
- `grn_items` INSERT → update `po_items.received_qty`

---

## Dev Conventions

### Adding a New Module
Follow this pattern for every new module:

```
1. src/types/<module>.ts              — Type + FormData type
2. src/app/actions/<module>.ts        — getAll, getById, create, update, toggleStatus, getForSelect
3. src/app/dashboard/<module>/page.tsx
   src/app/dashboard/<module>/new/page.tsx
   src/app/dashboard/<module>/[id]/page.tsx
4. src/components/modules/<module>/<Name>List.tsx
   src/components/modules/<module>/<Name>Form.tsx
```

**Rules:**
- Always `revalidatePath()` after mutations
- Delete + reinsert items on update for child tables
- Use `Promise.all()` for parallel data fetching in page components
- Server actions go in `src/app/actions/` with `'use server'` directive
- Client components use `'use client'` directive

### Permission Constants
Always use constants from `@/constants/permissions` — never raw strings:

```typescript
// ✅ Correct
import { MODULES, PAGES } from '@/constants/permissions'
checkPermission(roleId, MODULES.SALES, PAGES.SALES.INVOICE, 'can_edit')

// ❌ Wrong
checkPermission(roleId, 'sales', 'invoice', 'can_edit')
