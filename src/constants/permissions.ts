// Use these constants everywhere in your app instead of raw strings
// This prevents typos and makes refactoring easy

export const MODULES = {
  SALES: 'sales',
  PURCHASE: 'purchase',
  PRODUCTION: 'production',
  FINANCE: 'finance',
  HR: 'hr',
  LOGISTICS: 'logistics',
  QUALITY: 'quality',
  CONTRACTORS: 'contractors',
  MAINTENANCE: 'maintenance',
  STORES: 'stores',
  ASSETS: 'assets',
  STATUTORY: 'statutory',
  FORECASTING: 'forecasting',
  SYSTEM: 'system',
  MASTER: 'master',
} as const

export const PAGES = {
  SALES: {
    INQUIRY: 'inquiry',
    QUOTATION: 'quotation',
    CUSTOMER_PO: 'customer_po',
    SALE_ORDER: 'sale_order',
    DISPATCH: 'dispatch',
    INVOICE: 'invoice',
    COLLECTION: 'collection',
    RECEIPT_VOUCHER: 'receipt_voucher',
  },
  PURCHASE: {
    INDENT: 'indent',
    PO: 'po',
    SCHEDULE: 'schedule',
    GRN: 'grn',
    IQC: 'iqc',
    RECEIPT: 'receipt',
    BILLBOOK: 'billbook',
    PAYMENT: 'payment',
  },
  PRODUCTION: {
    BOM: 'bom',
    ROUTE_CARD: 'route_card',
    MATERIAL_ISSUE: 'material_issue',
    MTA: 'mta',
    REPORT: 'report',
    JOB_ORDER: 'job_order',
    CHALLAN_OUT: 'challan_out',
    EXTERNAL_GRN: 'external_grn',
    JOB_BILLBOOK: 'job_billbook',
    ROUTE_CLOSURE: 'route_closure',
  },
  FINANCE: {
    JOURNAL: 'journal',
    PAYMENT_RECEIPT: 'payment_receipt',
    CONTRA: 'contra',
    GST_JOURNAL: 'gst_journal',
    BANK_RECON: 'bank_recon',
    CREDIT_CARD: 'credit_card',
  },
  HR: {
    EMPLOYEE_MASTER: 'employee_master',
    SALARY_HEAD: 'salary_head',
    SALARY_STRUCTURE: 'salary_structure',
    SALARY_SHEET: 'salary_sheet',
    ADVANCE_MEMO: 'advance_memo',
  },
  LOGISTICS: {
    TRANSPORT_MASTER: 'transport_master',
    TRANSPORT_ORDER: 'transport_order',
    CHALLAN_OUT: 'challan_out',
    FREIGHT_BILLBOOK: 'freight_billbook',
  },
  QUALITY: {
    IQC: 'iqc',
    MTS: 'mts',
    PQC: 'pqc',
    PDI: 'pdi',
    QRD: 'qrd',
  },
  CONTRACTORS: {
    EMPLOYEE_MASTER: 'employee_master',
    SALARY_HEAD: 'salary_head',
    SALARY_STRUCTURE: 'salary_structure',
    SALARY_SHEET: 'salary_sheet',
    ADVANCE_MEMO: 'advance_memo',
    PAYMENT: 'payment',
  },
  MAINTENANCE: {
    TOOL_MASTER: 'tool_master',
    MAINTENANCE_CHART: 'maintenance_chart',
    CALIBRATION: 'calibration',
    RECTIFICATION: 'rectification',
  },
  STORES: {
    WAREHOUSE_MASTER: 'warehouse_master',
    OPENING_STOCK: 'opening_stock',
    DISPATCH_SRV: 'dispatch_srv',
    STOCK_TRANSFER: 'stock_transfer',
    MATERIAL_RECEIPT: 'material_receipt',
  },
  ASSETS: {
    ASSET_MASTER: 'asset_master',
    ADDITION_MEMO: 'addition_memo',
    ALLOCATION: 'allocation',
    SALE_MEMO: 'sale_memo',
    DEPRECIATION: 'depreciation',
  },
  STATUTORY: {
    GST_MASTER: 'gst_master',
    GSTR1: 'gstr1',
    GST2A_RECON: 'gst2a_recon',
    GST_CHALLAN: 'gst_challan',
    TDS: 'tds',
    TCS: 'tcs',
    GSTR_REGISTER: 'gstr_register',
    CHEQUE_BOOK: 'cheque_book',
    BALANCE_SHEET: 'balance_sheet',
  },
  FORECASTING: {
    MPS_INPUT: 'mps_input',
    MRP: 'mrp',
    CRP: 'crp',
    COST_ESTIMATE: 'cost_estimate',
  },
  SYSTEM: {
    USERS: 'users',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
  },
  MASTER: {
    CUSTOMERS: 'customers',
    PRODUCTS: 'products',
    VENDORS: 'vendors',
    WAREHOUSES: 'warehouses',
    TRANSPORT: 'transport',
  },
} as const

// Permission action types
export type PermissionAction = 'can_view' | 'can_create' | 'can_edit' | 'can_delete'

// Type for a single permission row
export type Permission = {
  module: string
  page: string
  can_view: number
  can_create: number
  can_edit: number
  can_delete: number
}