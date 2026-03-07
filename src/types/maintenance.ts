// ── Tool Master ────────────────────────────────────────────────────────────

export interface Tool {
  id: number
  tool_code: string
  tool_name: string
  category: string
  make: string | null
  model: string | null
  serial_number: string | null
  location: string | null
  purchase_date: string | null
  purchase_cost: number | null
  condition: string
  is_active: 0 | 1
  remarks: string | null
  created_at: string
  updated_at: string
}

export interface ToolFormData {
  tool_code: string
  tool_name: string
  category: string
  make: string | null
  model: string | null
  serial_number: string | null
  location: string | null
  purchase_date: string | null
  purchase_cost: number | null
  condition: string
  remarks: string | null
}
