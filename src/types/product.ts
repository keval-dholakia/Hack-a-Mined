export type Product = {
  id:               number
  code:             string | null
  name:             string
  description:      string | null
  category:         string | null
  unit:             string
  hsn_code:         string | null
  gst_percent:      number
  purchase_price:   number
  sale_price:       number
  min_stock_level:  number
  current_stock:    number
  is_active:        number
  created_at:       string
  updated_at:       string
}

export type ProductFormData = {
  code:             string
  name:             string
  description:      string
  category:         string
  unit:             string
  hsn_code:         string
  gst_percent:      number
  purchase_price:   number
  sale_price:       number
  min_stock_level:  number
}