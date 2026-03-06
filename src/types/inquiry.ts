export type Inquiry = {
  id:              number
  inquiry_no:      string
  customer_id:     number
  inquiry_date:    string
  sales_person_id: number | null
  status:          'New' | 'Processing' | 'Quoted' | 'Lost'
  delivery_date:   string | null
  remarks:         string | null
  created_at:      string
  updated_at:      string
  // joined
  customer?:       { name: string; code: string | null }
  sales_person?:   { name: string } | null
}

export type InquiryItem = {
  id:            number
  inquiry_id:    number
  product_id:    number
  quantity:      number
  target_price:  number | null
  current_stock: number
  blocked_stock: number
  net_available: number
  // joined
  product?:      { name: string; code: string | null; unit: string }
}

export type InquiryFormData = {
  inquiry_no:      string
  customer_id:     number
  inquiry_date:    string
  sales_person_id: number | null
  status:          string
  delivery_date:   string
  remarks:         string
  items:           InquiryItemFormData[]
}

export type InquiryItemFormData = {
  product_id:    number
  quantity:      number
  target_price:  number
  current_stock: number
  blocked_stock: number
  net_available: number
}