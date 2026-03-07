export const MODULES = {
  SALES:       'sales',
  PURCHASE:    'purchase',
  PRODUCTION:  'production',
  FINANCE:     'finance',
  HR:          'hr',
  LOGISTICS:   'logistics',
  QUALITY:     'quality',
  CONTRACTORS: 'contractors',
  MAINTENANCE: 'maintenance',
  STORES:      'stores',
  ASSETS:      'assets',
  STATUTORY:   'statutory',
  FORECASTING: 'forecasting',
  SYSTEM:      'system',
  MASTER:      'master',
} as const

export const PAGES = {
  SALES: {
    INQUIRY:     'inquiry',
    QUOTATION:   'quotation',
    CUSTOMER_PO: 'customer-po',
    SALE_ORDER:  'sale-order',
    DISPATCH:    'dispatch',
    INVOICE:     'invoice',
    COLLECTIONS: 'collections',
    REMINDERS:   'reminders',
  },
  PURCHASE: {
    INDENT:   'indent',
    PO:       'po',
    GRN:      'grn',
    IQC:      'iqc',
    BILLBOOK: 'billbook',
  },
  PRODUCTION: {
    BOM:            'bom',
    ROUTE_CARD:     'route-card',
    MATERIAL_ISSUE: 'material-issue',
    JOB_ORDER:      'job-order',
    REPORT:         'report',
  },
  FINANCE: {
    JOURNAL:         'journal',
    PAYMENT_RECEIPT: 'payment-receipt',
    CONTRA:          'contra',
    GST_JOURNAL:     'gst-journal',
    BANK_RECON:      'bank-recon',
    CREDIT_CARD:     'credit-card',
  },
  HR: {
    EMPLOYEES:        'employees',
    SALARY_HEADS:     'salary-heads',
    SALARY_STRUCTURE: 'salary-structure',
    SALARY_SHEET:     'salary-sheet',
    ADVANCE_MEMO:     'advance-memo',
  },
  LOGISTICS: {
    TRANSPORT_ORDER:  'transport-order',
    CHALLAN_OUT:      'challan-out',
    FREIGHT_BILLBOOK: 'freight-billbook',
  },
  QUALITY: {
    IQC: 'iqc',
    MTS: 'mts',
    PQC: 'pqc',
    PDI: 'pdi',
    QRD: 'qrd',
  },
  CONTRACTORS: {
    WORKERS:          'workers',
    ROLES:            'roles',
    SALARY_STRUCTURE: 'salary-structure',
    SALARY_SHEET:     'salary-sheet',
    ADVANCE_MEMO:     'advance-memo',
    PAYMENTS:         'payments',
  },
  MAINTENANCE: {
    TOOL_MASTER:   'tool-master',
    CALIBRATION:   'calibration',
    RECTIFICATION: 'rectification',
  },
  STORES: {
    WAREHOUSE_MASTER: 'warehouse-master',
    OPENING_STOCK:    'opening-stock',
    DISPATCH_SRV:     'dispatch-srv',
    STOCK_TRANSFER:   'stock-transfer',
    MATERIAL_RECEIPT: 'material-receipt',
  },
  ASSETS: {
    ASSET_MASTER: 'asset-master',
    ALLOCATION:   'allocation',
    DEPRECIATION: 'depreciation',
  },
  STATUTORY: {
    GST:          'gst',
    TDS_TCS:      'tds-tcs',
    BALANCE_SHEET:'balance-sheet',
  },
  FORECASTING: {
    SIMULATION: 'simulation',
  },
  SYSTEM: {
    USERS:       'users',
    ROLES:       'roles',
    PERMISSIONS: 'permissions',
  },
  MASTER: {
    CUSTOMERS:  'customers',
    PRODUCTS:   'products',
    VENDORS:    'vendors',
    WAREHOUSES: 'warehouses',
    TRANSPORT:  'transport',
  },
} as const

export type PermissionAction = 'can_view' | 'can_create' | 'can_edit' | 'can_delete'

export type Permission = {
  module:     string
  page:       string
  can_view:   number
  can_create: number
  can_edit:   number
  can_delete: number
}