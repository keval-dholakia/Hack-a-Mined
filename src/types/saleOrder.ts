export type SaleOrder = {
  id:               number
  so_no:            string
  customer_id:      number
  inquiry_id:       number | null
  customer_po_no:   string | null
  customer_po_date: string | null
  so_date:          string
  delivery_date:    string | null
  billing_address:  string | null
  shipping_address: string | null
  transporter_id:   number | null
  vehicle_no:       string | null
  driver_name:      string | null
  status:           'Pending' | 'Dispatched' | 'Closed'
  remarks:          string | null
  created_at:       string
  updated_at:       string
  // joined
  customer?:        { name: string; code: string | null }
  inquiry?:         { inquiry_no: string } | null
  transporter?:     { name: string } | null
  items?:           SaleOrderItem[]
}

export type SaleOrderItem = {
  id:            number
  so_id:         number
  product_id:    number
  quantity:      number
  rate:          number
  gst_percent:   number
  taxable_value: number
  gst_amount:    number
  total:         number
  product?:      { name: string; code: string | null; unit: string }
}

export type SaleOrderFormData = {
  so_no:            string
  customer_id:      number
  inquiry_id:       number | null
  customer_po_no:   string
  customer_po_date: string
  so_date:          string
  delivery_date:    string
  billing_address:  string
  shipping_address: string
  transporter_id:   number | null
  vehicle_no:       string
  driver_name:      string
  status:           string
  remarks:          string
  items:            SaleOrderItemFormData[]
}

export type SaleOrderItemFormData = {
  product_id:    number
  quantity:      number
  rate:          number
  gst_percent:   number
  taxable_value: number
  gst_amount:    number
  total:         number
}