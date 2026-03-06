export type ReceiptVoucher = {
  id:           number
  receipt_no:   string
  invoice_id:   number | null
  customer_id:  number
  receipt_date: string
  amount:       number
  mode:         'Cash' | 'Cheque' | 'NEFT' | 'UPI'
  ref_no:       string | null
  remarks:      string | null
  created_at:   string
  // joined
  customer?:    { name: string; code: string | null }
  invoice?:     { invoice_no: string; grand_total: number; payment_status: string } | null
}

export type ReceiptVoucherFormData = {
  receipt_no:   string
  invoice_id:   number | null
  customer_id:  number
  receipt_date: string
  amount:       number
  mode:         string
  ref_no:       string
  remarks:      string
}