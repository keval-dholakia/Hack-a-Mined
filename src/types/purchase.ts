export type PurchaseOrder = {
  id:            number
  po_no:         string
  vendor_id:     number
  po_date:       string
  valid_until:   string | null
  delivery_date: string | null
  status:        'Open' | 'Partial' | 'Received' | 'Cancelled'
  remarks:       string | null
  created_at:    string
  updated_at:    string
  vendor?:       { name: string; code: string | null }
  items?:        POItem[]
}

export type POItem = {
  id:            number
  po_id:         number
  product_id:    number
  quantity:      number
  rate:          number
  gst_percent:   number
  expected_date: string | null
  received_qty:  number
  product?:      { name: string; code: string | null; unit: string }
}

export type POFormData = {
  po_no:         string
  vendor_id:     number
  po_date:       string
  valid_until:   string
  delivery_date: string
  status:        string
  remarks:       string
  items:         POItemFormData[]
}

export type POItemFormData = {
  product_id:    number
  quantity:      number
  rate:          number
  gst_percent:   number
  expected_date: string
  received_qty:  number
}

// ── GRN ──────────────────────────────────────
export type GRN = {
  id:                number
  grn_no:            string
  po_id:             number
  vendor_id:         number
  vendor_challan_no: string | null
  gate_entry_date:   string
  vehicle_no:        string | null
  warehouse_id:      number | null
  status:            'Pending' | 'IQC Done' | 'Received'
  remarks:           string | null
  created_at:        string
  updated_at:        string
  vendor?:           { name: string; code: string | null }
  purchase_order?:   { po_no: string }
  warehouse?:        { name: string } | null
  items?:            GRNItem[]
}

export type GRNItem = {
  id:           number
  grn_id:       number
  product_id:   number
  ordered_qty:  number
  received_qty: number
  accepted_qty: number
  rejected_qty: number
  sample_size:  number
  rack_bin:     string | null
  batch_no:     string | null
  product?:     { name: string; code: string | null; unit: string }
}

export type GRNFormData = {
  grn_no:            string
  po_id:             number
  vendor_id:         number
  vendor_challan_no: string
  gate_entry_date:   string
  vehicle_no:        string
  warehouse_id:      number | null
  status:            string
  remarks:           string
  items:             GRNItemFormData[]
}

export type GRNItemFormData = {
  product_id:   number
  ordered_qty:  number
  received_qty: number
  accepted_qty: number
  rejected_qty: number
  sample_size:  number
  rack_bin:     string
  batch_no:     string
}

// ── IQC ──────────────────────────────────────
export type IQCEntry = {
  id:              number
  grn_id:          number
  product_id:      number
  check_date:      string
  total_qty:       number
  sample_size:     number
  accepted_qty:    number
  rejected_qty:    number
  visual_check:    'Pass' | 'Fail'
  dimension_check: 'Pass' | 'Fail'
  result:          'Pass' | 'Fail' | 'Partial'
  remarks:         string | null
  checked_by:      number | null
  created_at:      string
  grn?:            { grn_no: string }
  product?:        { name: string; code: string | null; unit: string }
}

export type IQCFormData = {
  grn_id:          number
  product_id:      number
  check_date:      string
  total_qty:       number
  sample_size:     number
  accepted_qty:    number
  rejected_qty:    number
  visual_check:    string
  dimension_check: string
  result:          string
  remarks:         string
  checked_by:      number | null
}

// ── Purchase Bill ─────────────────────────────
export type PurchaseBill = {
  id:                number
  bill_no:           string
  vendor_id:         number
  grn_id:            number | null
  vendor_invoice_no: string | null
  invoice_date:      string
  taxable_value:     number
  gst_amount:        number
  total:             number
  payment_status:    'Unpaid' | 'Partial' | 'Paid'
  created_at:        string
  updated_at:        string
  vendor?:           { name: string; code: string | null }
  grn?:              { grn_no: string } | null
}

export type PurchaseBillFormData = {
  bill_no:           string
  vendor_id:         number
  grn_id:            number | null
  vendor_invoice_no: string
  invoice_date:      string
  taxable_value:     number
  gst_amount:        number
  total:             number
  payment_status:    string
}