export type Warehouse = {
  id:             number
  code:           string | null
  name:           string
  address:        string | null
  city:           string | null
  state:          string | null
  manager_name:   string | null
  manager_mobile: string | null
  is_active:      number
  created_at:     string
  updated_at:     string
}

export type WarehouseFormData = {
  code:           string
  name:           string
  address:        string
  city:           string
  state:          string
  manager_name:   string
  manager_mobile: string
}