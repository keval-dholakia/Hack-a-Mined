export type TransportMaster = {
  id:         number
  name:       string
  owner_name: string | null
  mobile:     string | null
  gstin:      string | null
  address:    string | null
  is_active:  number
  created_at: string
  updated_at: string
}

export type TransportFormData = {
  name:       string
  owner_name: string
  mobile:     string
  gstin:      string
  address:    string
}