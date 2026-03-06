'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Permission, MODULES } from '@/constants/permissions'
import styles from './Sidebar.module.scss'
import type { SessionUser } from '@/types/auth'

type SubItem = {
  label: string
  path:  string
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
          { label: 'Inquiry',     path: '/dashboard/sales/inquiry'     },
          { label: 'Quotation',   path: '/dashboard/sales/quotation'   },
          { label: 'Sale Order',  path: '/dashboard/sales/sale-order'  },
          { label: 'Invoice',     path: '/dashboard/sales/invoice'     },
          { label: 'Collections', path: '/dashboard/sales/collections' },
        ],
      },
      {
        key:   MODULES.PURCHASE,
        label: 'Purchase',
        icon:  '◉',
        path:  '/dashboard/purchase',
        subItems: [
          { label: 'Indent',   path: '/dashboard/purchase/indent'   },
          { label: 'PO',       path: '/dashboard/purchase/po'       },
          { label: 'GRN',      path: '/dashboard/purchase/grn'      },
          { label: 'IQC',      path: '/dashboard/purchase/iqc'      },
          { label: 'Billbook', path: '/dashboard/purchase/billbook' },
        ],
      },
      {
        key:   MODULES.PRODUCTION,
        label: 'Production',
        icon:  '▣',
        path:  '/dashboard/production',
        subItems: [
          { label: 'Route Card',      path: '/dashboard/production/route-card'      },
          { label: 'Material Issue',  path: '/dashboard/production/material-issue'  },
          { label: 'Job Order',       path: '/dashboard/production/job-order'       },
          { label: 'Report',          path: '/dashboard/production/report'          },
        ],
      },
      {
        key:   MODULES.LOGISTICS,
        label: 'Logistics',
        icon:  '⬡',
        path:  '/dashboard/logistics',
        subItems: [
          { label: 'Transport Order',  path: '/dashboard/logistics/transport-order'  },
          { label: 'Challan Out',      path: '/dashboard/logistics/challan-out'      },
          { label: 'Freight Billbook', path: '/dashboard/logistics/freight-billbook' },
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
          { label: 'IQC', path: '/dashboard/quality/iqc' },
          { label: 'PQC', path: '/dashboard/quality/pqc' },
          { label: 'PDI', path: '/dashboard/quality/pdi' },
          { label: 'QRD', path: '/dashboard/quality/qrd' },
        ],
      },
      {
        key:   MODULES.STORES,
        label: 'Stores',
        icon:  '▤',
        path:  '/dashboard/stores',
        subItems: [
          { label: 'Opening Stock',   path: '/dashboard/stores/opening-stock'   },
          { label: 'Stock Transfer',  path: '/dashboard/stores/stock-transfer'  },
          { label: 'Dispatch SRV',    path: '/dashboard/stores/dispatch-srv'    },
        ],
      },
      {
        key:   MODULES.MAINTENANCE,
        label: 'Maintenance',
        icon:  '◧',
        path:  '/dashboard/maintenance',
        subItems: [
          { label: 'Tool Master',   path: '/dashboard/maintenance/tool-master'   },
          { label: 'Calibration',   path: '/dashboard/maintenance/calibration'   },
          { label: 'Rectification', path: '/dashboard/maintenance/rectification' },
        ],
      },
      {
        key:   MODULES.ASSETS,
        label: 'Assets',
        icon:  '◇',
        path:  '/dashboard/assets',
        subItems: [
          { label: 'Asset Master',  path: '/dashboard/assets/asset-master'  },
          { label: 'Allocation',    path: '/dashboard/assets/allocation'    },
          { label: 'Depreciation',  path: '/dashboard/assets/depreciation'  },
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
          { label: 'Journal',         path: '/dashboard/finance/journal'          },
          { label: 'Payment/Receipt', path: '/dashboard/finance/payment-receipt'  },
          { label: 'Bank Recon',      path: '/dashboard/finance/bank-recon'       },
          { label: 'Credit Card',     path: '/dashboard/finance/credit-card'      },
        ],
      },
      {
        key:   MODULES.HR,
        label: 'HR',
        icon:  '◉',
        path:  '/dashboard/hr',
        subItems: [
          { label: 'Employees',       path: '/dashboard/hr/employees'        },
          { label: 'Salary Sheet',    path: '/dashboard/hr/salary-sheet'     },
          { label: 'Advance Memo',    path: '/dashboard/hr/advance-memo'     },
        ],
      },
      {
        key:   MODULES.CONTRACTORS,
        label: 'Contractors',
        icon:  '▣',
        path:  '/dashboard/contractors',
        subItems: [
          { label: 'Workers',      path: '/dashboard/contractors/workers'      },
          { label: 'Salary Sheet', path: '/dashboard/contractors/salary-sheet' },
          { label: 'Payments',     path: '/dashboard/contractors/payments'     },
        ],
      },
      {
        key:   MODULES.STATUTORY,
        label: 'Statutory',
        icon:  '⬡',
        path:  '/dashboard/statutory',
        subItems: [
          { label: 'GST',           path: '/dashboard/statutory/gst'           },
          { label: 'TDS/TCS',       path: '/dashboard/statutory/tds-tcs'       },
          { label: 'Balance Sheet', path: '/dashboard/statutory/balance-sheet' },
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
        path:  '/dashboard/forecasting',
        subItems: [
          { label: 'MRP',           path: '/dashboard/forecasting/mrp'           },
          { label: 'CRP',           path: '/dashboard/forecasting/crp'           },
          { label: 'Cost Estimate', path: '/dashboard/forecasting/cost-estimate' },
        ],
      },
    ],
  },
]

type Props = {
  permissions:  Permission[]
  isSuperAdmin: boolean
  user:         SessionUser  // ← add this
}

export default function Sidebar({ permissions, isSuperAdmin, user }: Props) {
  const pathname = usePathname()
  const [collapsed,     setCollapsed]     = useState(false)
  const [openModules,   setOpenModules]   = useState<string[]>([MODULES.SALES])

  function canViewModule(moduleKey: string): boolean {
    if (isSuperAdmin) return true
    return permissions.some(p => p.module === moduleKey && p.can_view === 1)
  }

  function toggleModule(key: string) {
    setOpenModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function isModuleOpen(key: string): boolean {
    return openModules.includes(key)
  }

  function isActive(path: string): boolean {
    return pathname === path
  }

  function isModuleActive(module: ModuleItem): boolean {
    if (pathname === module.path) return true
    return module.subItems?.some(s => pathname.startsWith(s.path)) ?? false
  }

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
                const open   = isModuleOpen(module.key)
                const active = isModuleActive(module)

                return (
                  <div key={module.key}>
                    {/* Module row */}
                    <div
                      className={`${styles.moduleRow} ${active ? styles.moduleActive : ''}`}
                      onClick={() => !collapsed && toggleModule(module.key)}
                    >
                      <span className={styles.moduleIcon}>{module.icon}</span>
                      {!collapsed && (
                        <>
                          <span className={styles.moduleLabel}>{module.label}</span>
                          {module.subItems && (
                            <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
                              ›
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Sub items */}
                    {!collapsed && open && module.subItems && (
                      <div className={styles.subList}>
                        {module.subItems.map(sub => (
                          <Link
                            key={sub.path}
                            href={sub.path}
                            className={`${styles.subItem} ${isActive(sub.path) ? styles.subActive : ''}`}
                          >
                            {sub.label}
                          </Link>
                        ))}
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
          <div className={styles.userAvatar}>N</div>
          <div className={styles.userText}>
            <span className={styles.userName}>Admin</span>
            <span className={styles.userRole}>Super Admin</span>
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