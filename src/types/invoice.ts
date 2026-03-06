export type Invoice = {
  id:               number
  invoice_no:       string
  so_id:            number | null
  customer_id:      number
  invoice_date:     string
  due_date:         string | null
  place_of_supply:  string | null
  eway_bill_no:     string | null
  taxable_value:    number
  gst_amount:       number
  round_off:        number
  grand_total:      number
  payment_status:   'Unpaid' | 'Partial' | 'Paid'
  reminder_setting: 'Strict' | 'Moderate' | 'Lenient'
  created_at:       string
  updated_at:       string
  // joined
  customer?:        { name: string; code: string | null; credit_period: number; place_of_supply: string | null }
  sale_order?:      { so_no: string } | null
  items?:           InvoiceItem[]
}

export type InvoiceItem = {
  id:            number
  invoice_id:    number
  product_id:    number
  quantity:      number
  rate:          number
  gst_percent:   number
  taxable_value: number
  gst_amount:    number
  total:         number
  product?:      { name: string; code: string | null; unit: string }
}

export type InvoiceFormData = {
  invoice_no:       string
  so_id:            number | null
  customer_id:      number
  invoice_date:     string
  due_date:         string
  place_of_supply:  string
  eway_bill_no:     string
  taxable_value:    number
  gst_amount:       number
  round_off:        number
  grand_total:      number
  payment_status:   string
  reminder_setting: string
  items:            InvoiceItemFormData[]
}

export type InvoiceItemFormData = {
  product_id:    number
  quantity:      number
  rate:          number
  gst_percent:   number
  taxable_value: number
  gst_amount:    number
  total:         number
}