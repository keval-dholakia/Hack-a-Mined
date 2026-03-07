// src/types/quality.ts

export interface IQCEntry {
  id: number
  grn_id: number
  product_id: number
  total_qty: number
  sample_size: number
  accepted_qty: number
  rejected_qty: number
  visual_check: boolean
  dimension_check: boolean
  result: 'Pass' | 'Fail' | 'Rework'
  checked_by: number | null
  created_at: string

  // Joined fields (from select with relations)
  grn_no?: string
  vendor_name?: string
  product_code?: string
  product_name?: string
  checker_name?: string
}

export interface IQCFormData {
  grn_id: number
  product_id: number
  total_qty: number
  sample_size: number
  accepted_qty: number
  rejected_qty: number
  visual_check: boolean
  dimension_check: boolean
  result: 'Pass' | 'Fail' | 'Rework'
  checked_by: number | null
}

export interface GRNSelectOption {
  id: number
  grn_no: string
  vendor_name: string
  gate_entry_date: string
}

export interface GRNItem {
  id: number
  grn_id: number
  product_id: number
  received_qty: number
  accepted_qty: number | null
  rejected_qty: number | null
  product_code?: string
  product_name?: string
}

// ── PQC Types ─────────────────────────────────────────────

export const PQC_STAGES = [
  'Raw Material Check',
  'Cutting',
  'Bending / Forming',
  'Welding',
  'Surface Treatment',
  'Machining',
  'Assembly',
  'Testing',
  'Final Inspection',
] as const

export type PQCStage = typeof PQC_STAGES[number]

export interface PQCEntry {
  id: number
  route_card_id: number
  product_id: number
  stage_name: string
  operator_id: number | null
  result: 'Pass' | 'Fail' | 'Rework'
  remarks: string | null
  created_at: string

  // Joined fields
  route_card_no?: string
  batch_no?: string
  product_code?: string
  product_name?: string
  operator_name?: string
}

export interface PQCFormData {
  route_card_id: number
  product_id: number
  stage_name: string
  operator_id: number | null
  result: 'Pass' | 'Fail' | 'Rework'
  remarks: string
}

export interface RouteCardSelectOption {
  id: number
  route_card_no: string
  batch_no: string | null
  product_id: number
  product_code: string
  product_name: string
  status: string
}
