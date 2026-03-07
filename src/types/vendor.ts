export type Vendor = {
  id:             number
  code:           string | null
  name:           string
  gstin:          string | null
  pan:            string | null
  contact_person: string | null
  mobile:         string | null
  email:          string | null
  address:        string | null
  city:           string | null
  state:          string | null
  pincode:        string | null
  bank_name:      string | null
  bank_account:   string | null
  bank_ifsc:      string | null
  payment_terms:  number
  is_active:      number
  created_at:     string
  updated_at:     string
}

export type VendorFormData = {
  code:           string
  name:           string
  gstin:          string
  pan:            string
  contact_person: string
  mobile:         string
  email:          string
  address:        string
  city:           string
  state:          string
  pincode:        string
  bank_name:      string
  bank_account:   string
  bank_ifsc:      string
  payment_terms:  number
}