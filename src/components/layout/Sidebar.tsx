'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Permission, MODULES, PAGES } from '@/constants/permissions'
import styles from './Sidebar.module.scss'
import type { SessionUser } from '@/types/auth'

type SubItem = {
  label: string
  path:  string
  key?:  string
}

type ModuleItem = {
  key:       string
  label:     string
  icon:      string
  path:      string
  subItems?: SubItem[]
}

type Group = {
  label:   string
  modules: ModuleItem[]
}

const NAV_GROUPS: Group[] = [
  {
    label: 'OPERATIONS',
    modules: [
      {
        key:   MODULES.SALES,
        label: 'Sales',
        icon:  '◈',
        path:  '/dashboard/sales',
        subItems: [
          { label: 'Inquiry',     path: '/dashboard/sales/inquiry',     key: PAGES.SALES.INQUIRY     },
          { label: 'Quotation',   path: '/dashboard/sales/quotation',   key: PAGES.SALES.QUOTATION   },
          { label: 'Sale Order',  path: '/dashboard/sales/sale-order',  key: PAGES.SALES.SALE_ORDER  },
          { label: 'Invoice',     path: '/dashboard/sales/invoice',     key: PAGES.SALES.INVOICE     },
          { label: 'Collections', path: '/dashboard/sales/collections', key: PAGES.SALES.COLLECTIONS },
          { label: 'Reminders',   path: '/dashboard/sales/reminders',   key: PAGES.SALES.REMINDERS   },
        ],
      },
      {
        key:   MODULES.PURCHASE,
        label: 'Purchase',
        icon:  '◉',
        path:  '/dashboard/purchase',
        subItems: [
          { label: 'Indent',   path: '/dashboard/purchase/indent',   key: PAGES.PURCHASE.INDENT   },
          { label: 'PO',       path: '/dashboard/purchase/po',       key: PAGES.PURCHASE.PO       },
          { label: 'GRN',      path: '/dashboard/purchase/grn',      key: PAGES.PURCHASE.GRN      },
          { label: 'IQC',      path: '/dashboard/purchase/iqc',      key: PAGES.PURCHASE.IQC      },
          { label: 'Billbook', path: '/dashboard/purchase/billbook', key: PAGES.PURCHASE.BILLBOOK },
        ],
      },
      {
        key:   MODULES.PRODUCTION,
        label: 'Production',
        icon:  '▣',
        path:  '/dashboard/production',
        subItems: [
          { label: 'Route Card',      path: '/dashboard/production/route-card',      key: PAGES.PRODUCTION.ROUTE_CARD      },
          { label: 'Material Issue',  path: '/dashboard/production/material-issue',  key: PAGES.PRODUCTION.MATERIAL_ISSUE  },
          { label: 'Job Order',       path: '/dashboard/production/job-order',       key: PAGES.PRODUCTION.JOB_ORDER       },
          { label: 'Report',          path: '/dashboard/production/report',          key: PAGES.PRODUCTION.REPORT          },
        ],
      },
      {
        key:   MODULES.LOGISTICS,
        label: 'Logistics',
        icon:  '⬡',
        path:  '/dashboard/logistics',
        subItems: [
          { label: 'Transport Order', path: '/dashboard/logistics/transport-order', key: PAGES.LOGISTICS.TRANSPORT_ORDER },
          { label: 'Challan Out',     path: '/dashboard/logistics/challan-out',     key: PAGES.LOGISTICS.CHALLAN_OUT     },
          { label: 'Freight Billbook',path: '/dashboard/logistics/freight-billbook',key: PAGES.LOGISTICS.FREIGHT_BILLBOOK},
        ],
      },
    ],
  },
  {
    label: 'MANAGEMENT',
    modules: [
      {
        key:   MODULES.QUALITY,
        label: 'Quality',
        icon:  '◎',
        path:  '/dashboard/quality',
        subItems: [
          { label: 'IQC', path: '/dashboard/quality/iqc', key: PAGES.QUALITY.IQC },
          { label: 'PQC', path: '/dashboard/quality/pqc', key: PAGES.QUALITY.PQC },
          { label: 'PDI', path: '/dashboard/quality/pdi', key: PAGES.QUALITY.PDI },
          { label: 'QRD', path: '/dashboard/quality/qrd', key: PAGES.QUALITY.QRD },
        ],
      },
      {
        key:   MODULES.STORES,
        label: 'Stores',
        icon:  '▤',
        path:  '/dashboard/stores',
        subItems: [
          { label: 'Warehouse Master', path: '/dashboard/stores/warehouse-master', key: PAGES.STORES.WAREHOUSE_MASTER },
          { label: 'Opening Stock',    path: '/dashboard/stores/opening-stock',    key: PAGES.STORES.OPENING_STOCK    },
          { label: 'Dispatch SRV',     path: '/dashboard/stores/dispatch-srv',     key: PAGES.STORES.DISPATCH_SRV     },
          { label: 'Stock Transfer',   path: '/dashboard/stores/stock-transfer',   key: PAGES.STORES.STOCK_TRANSFER   },
          { label: 'Material Receipt', path: '/dashboard/stores/material-receipt', key: PAGES.STORES.MATERIAL_RECEIPT },
        ],
      },
      {
        key:   MODULES.MAINTENANCE,
        label: 'Maintenance',
        icon:  '◧',
        path:  '/dashboard/maintenance',
        subItems: [
          { label: 'Tool Master',   path: '/dashboard/maintenance/tool-master',   key: PAGES.MAINTENANCE.TOOL_MASTER   },
          { label: 'Calibration',   path: '/dashboard/maintenance/calibration',   key: PAGES.MAINTENANCE.CALIBRATION   },
          { label: 'Rectification', path: '/dashboard/maintenance/rectification', key: PAGES.MAINTENANCE.RECTIFICATION },
        ],
      },
      {
        key:   MODULES.ASSETS,
        label: 'Assets',
        icon:  '◇',
        path:  '/dashboard/assets',
        subItems: [
          { label: 'Asset Master', path: '/dashboard/assets/asset-master', key: PAGES.ASSETS.ASSET_MASTER },
          { label: 'Allocation',   path: '/dashboard/assets/allocation',   key: PAGES.ASSETS.ALLOCATION   },
          { label: 'Depreciation', path: '/dashboard/assets/depreciation', key: PAGES.ASSETS.DEPRECIATION },
        ],
      },
    ],
  },
  {
    label: 'FINANCE & HR',
    modules: [
      {
        key:   MODULES.FINANCE,
        label: 'Finance',
        icon:  '◈',
        path:  '/dashboard/finance',
        subItems: [
          { label: 'Journal',         path: '/dashboard/finance/journal',         key: PAGES.FINANCE.JOURNAL         },
          { label: 'Payment/Receipt', path: '/dashboard/finance/payment-receipt', key: PAGES.FINANCE.PAYMENT_RECEIPT },
          { label: 'Contra',          path: '/dashboard/finance/contra',          key: PAGES.FINANCE.CONTRA          },
          { label: 'GST Journal',     path: '/dashboard/finance/gst-journal',     key: PAGES.FINANCE.GST_JOURNAL     },
          { label: 'Bank Recon',      path: '/dashboard/finance/bank-recon',      key: PAGES.FINANCE.BANK_RECON      },
          { label: 'Credit Card',     path: '/dashboard/finance/credit-card',     key: PAGES.FINANCE.CREDIT_CARD     },
        ],
      },
      {
        key:   MODULES.HR,
        label: 'HR',
        icon:  '◉',
        path:  '/dashboard/hr',
        subItems: [
          { label: 'Employees',        path: '/dashboard/hr/employees',        key: PAGES.HR.EMPLOYEES        },
          { label: 'Salary Heads',     path: '/dashboard/hr/salary-heads',     key: PAGES.HR.SALARY_HEADS     },
          { label: 'Salary Structure', path: '/dashboard/hr/salary-structure', key: PAGES.HR.SALARY_STRUCTURE },
          { label: 'Salary Sheet',     path: '/dashboard/hr/salary-sheet',     key: PAGES.HR.SALARY_SHEET     },
          { label: 'Advance Memo',     path: '/dashboard/hr/advance-memo',     key: PAGES.HR.ADVANCE_MEMO     },
        ],
      },
      {
        key:   MODULES.CONTRACTORS,
        label: 'Contractors',
        icon:  '▣',
        path:  '/dashboard/contractors',
        subItems: [
          { label: 'Workers',          path: '/dashboard/contractors/workers',          key: PAGES.CONTRACTORS.WORKERS          },
          { label: 'Salary Head Rates',path: '/dashboard/contractors/roles',            key: PAGES.CONTRACTORS.ROLES            },
          { label: 'Salary Structure', path: '/dashboard/contractors/salary-structure', key: PAGES.CONTRACTORS.SALARY_STRUCTURE },
          { label: 'Salary Sheet',     path: '/dashboard/contractors/salary-sheet',     key: PAGES.CONTRACTORS.SALARY_SHEET     },
          { label: 'Advance Memo',     path: '/dashboard/contractors/advance-memo',     key: PAGES.CONTRACTORS.ADVANCE_MEMO     },
          { label: 'Payments',         path: '/dashboard/contractors/payments',         key: PAGES.CONTRACTORS.PAYMENTS         },
        ],
      },
      {
        key:   MODULES.STATUTORY,
        label: 'Statutory',
        icon:  '⬡',
        path:  '/dashboard/statutory',
        subItems: [
          { label: 'GST',           path: '/dashboard/statutory/gst',           key: PAGES.STATUTORY.GST           },
          { label: 'TDS/TCS',       path: '/dashboard/statutory/tds-tcs',       key: PAGES.STATUTORY.TDS_TCS       },
          { label: 'Balance Sheet', path: '/dashboard/statutory/balance-sheet', key: PAGES.STATUTORY.BALANCE_SHEET },
        ],
      },
    ],
  },
  {
    label: 'MASTERS',
    modules: [
      {
        key:   MODULES.MASTER,
        label: 'Master Data',
        icon:  '❑',
        path:  '/dashboard/masters',
        subItems: [
          { label: 'Customers',  path: '/dashboard/masters/customers',  key: PAGES.MASTER.CUSTOMERS  },
          { label: 'Products',   path: '/dashboard/masters/products',   key: PAGES.MASTER.PRODUCTS   },
          { label: 'Vendors',    path: '/dashboard/masters/vendors',    key: PAGES.MASTER.VENDORS    },
          { label: 'Warehouses', path: '/dashboard/masters/warehouses', key: PAGES.MASTER.WAREHOUSES },
          { label: 'Transport',  path: '/dashboard/masters/transport',  key: PAGES.MASTER.TRANSPORT  },
        ],
      },
    ],
  },
  {
    label: 'INTELLIGENCE',
    modules: [
      {
        key:   MODULES.FORECASTING,
        label: 'Simulation',
        icon:  '◇',
        path:  '/dashboard/simulation',
      },
    ],
  },
]

type Props = {
  permissions:  Permission[]
  isSuperAdmin: boolean
  user:         SessionUser
}

export default function Sidebar({ permissions, isSuperAdmin, user }: Props) {
  const pathname    = usePathname()
  const [collapsed, setCollapsed]   = useState(false)
  const [openModules, setOpenModules] = useState<string[]>([MODULES.SALES])

  function canViewPage(moduleKey: string, pageKey: string): boolean {
    if (isSuperAdmin) return true
    return permissions.some(
      p => p.module === moduleKey && p.page === pageKey && p.can_view === 1
    )
  }

  function canViewModule(moduleKey: string): boolean {
    if (isSuperAdmin) return true
    return permissions.some(p => p.module === moduleKey && p.can_view === 1)
  }

  function toggleModule(key: string) {
    setOpenModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function isActive(path: string): boolean {
    return pathname === path
  }

  function isModuleActive(module: ModuleItem): boolean {
    if (pathname === module.path) return true
    return module.subItems?.some(s => pathname.startsWith(s.path)) ?? false
  }

  // Get first letter of name for avatar
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>M</div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoName}>TechMicra</span>
            <span className={styles.logoSub}>ERP v1.0</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {/* Dashboard link */}
        <Link
          href="/dashboard"
          className={`${styles.moduleRow} ${pathname === '/dashboard' ? styles.moduleActive : ''}`}
        >
          <span className={styles.moduleIcon}>⊞</span>
          {!collapsed && <span className={styles.moduleLabel}>Dashboard</span>}
        </Link>

        {/* Groups */}
        {NAV_GROUPS.map(group => {
          const visibleModules = group.modules.filter(m => canViewModule(m.key))
          if (visibleModules.length === 0) return null

          return (
            <div key={group.label} className={styles.group}>
              {!collapsed && (
                <p className={styles.groupLabel}>{group.label}</p>
              )}

              {visibleModules.map(module => {
                const open   = openModules.includes(module.key)
                const active = isModuleActive(module)

                // Filter sub items by page permission
                const visibleSubItems = module.subItems?.filter(
                  sub => !sub.key || canViewPage(module.key, sub.key)
                ) ?? []

                // Hide module entirely if all sub items are hidden
                if (module.subItems && visibleSubItems.length === 0) return null

                return (
                  <div key={module.key}>
                    {/* Module row */}
                    {module.subItems && module.subItems.length > 0 ? (
                      <div
                        className={`${styles.moduleRow} ${active ? styles.moduleActive : ''}`}
                        onClick={() => !collapsed && toggleModule(module.key)}
                      >
                        <span className={styles.moduleIcon}>{module.icon}</span>
                        {!collapsed && (
                          <>
                            <span className={styles.moduleLabel}>{module.label}</span>
                            <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
                              ›
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={module.path}
                        className={`${styles.moduleRow} ${active ? styles.moduleActive : ''}`}
                      >
                        <span className={styles.moduleIcon}>{module.icon}</span>
                        {!collapsed && (
                          <span className={styles.moduleLabel}>{module.label}</span>
                        )}
                      </Link>
                    )}

                    {/* Sub items */}
                    {!collapsed && module.subItems && (
                      <div className={`${styles.subListContainer} ${open ? styles.subListOpen : ''}`}>
                        <div className={styles.subList}>
                          {visibleSubItems.map(sub => (
                            <Link
                              key={sub.path}
                              href={sub.path}
                              className={`${styles.subItem} ${isActive(sub.path) ? styles.subActive : ''}`}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User info at bottom */}
      {!collapsed && (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{avatarLetter}</div>
          <div className={styles.userText}>
            <span className={styles.userName}>{user?.name ?? 'User'}</span>
            <span className={styles.userRole}>{user?.role_name ?? '—'}</span>
          </div>
          <button className={styles.settingsBtn} title="Settings">⚙</button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed(p => !p)}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '→' : '←'}
      </button>

    </aside>
  )
}