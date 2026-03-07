export type BOMHeader = {
  id:                    number
  product_id:            number
  version:               string
  process_name:          string | null
  machine:               string | null
  output_qty:            number
  man_hours_per_unit:    number
  machine_hours_per_unit:number
  is_active:             number
  created_at:            string
  updated_at:            string
  product?:              { name: string; code: string | null; unit: string }
  items?:                BOMItem[]
}

export type BOMItem = {
  id:               number
  bom_id:           number
  raw_material_id:  number
  quantity_per_unit:number
  unit:             string
  remarks:          string | null
  raw_material?:    { name: string; code: string | null; unit: string }
}

export type BOMFormData = {
  product_id:             number
  version:                string
  process_name:           string
  machine:                string
  output_qty:             number
  man_hours_per_unit:     number
  machine_hours_per_unit: number
  items:                  BOMItemFormData[]
}

export type BOMItemFormData = {
  raw_material_id:  number
  quantity_per_unit:number
  unit:             string
  remarks:          string
}

// ── Route Card ────────────────────────────────
export type RouteCard = {
  id:            number
  route_card_no: string
  product_id:    number
  bom_id:        number | null
  batch_no:      string | null
  plan_qty:      number
  produced_qty:  number
  rejection_qty: number
  scrap_generated:number
  start_date:    string | null
  end_date:      string | null
  closed_date:   string | null
  status:        'Open' | 'In Progress' | 'Closed'
  remarks:       string | null
  created_at:    string
  updated_at:    string
  product?:      { name: string; code: string | null; unit: string }
  bom?:          { version: string; process_name: string | null } | null
}

export type RouteCardFormData = {
  route_card_no:  string
  product_id:     number
  bom_id:         number | null
  batch_no:       string
  plan_qty:       number
  produced_qty:   number
  rejection_qty:  number
  scrap_generated:number
  start_date:     string
  end_date:       string
  closed_date:    string
  status:         string
  remarks:        string
}

// ── Material Issue ────────────────────────────
export type MaterialIssue = {
  id:             number
  issue_no:       string
  route_card_id:  number
  product_id:     number
  warehouse_id:   number | null
  qty_requested:  number
  qty_issued:     number
  issue_date:     string
  issued_by:      number | null
  remarks:        string | null
  created_at:     string
  route_card?:    { route_card_no: string }
  product?:       { name: string; code: string | null; unit: string }
  warehouse?:     { name: string } | null
}

export type MaterialIssueFormData = {
  issue_no:      string
  route_card_id: number
  product_id:    number
  warehouse_id:  number | null
  qty_requested: number
  qty_issued:    number
  issue_date:    string
  issued_by:     number | null
  remarks:       string
}

// ── Production Report ─────────────────────────
export type ProductionReport = {
  id:             number
  report_date:    string
  route_card_id:  number | null
  product_id:     number
  shift:          'Day' | 'Night' | 'General'
  machine_no:     string | null
  operator_id:    number | null
  production_qty: number
  rejection_qty:  number
  remarks:        string | null
  created_at:     string
  route_card?:    { route_card_no: string } | null
  product?:       { name: string; code: string | null; unit: string }
  operator?:      { name: string } | null
}

export type ProductionReportFormData = {
  report_date:    string
  route_card_id:  number | null
  product_id:     number
  shift:          string
  machine_no:     string
  operator_id:    number | null
  production_qty: number
  rejection_qty:  number
  remarks:        string
}