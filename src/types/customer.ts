export type Customer = {
  id:               number
  code:             string | null
  name:             string
  gstin:            string | null
  pan:              string | null
  contact_person:   string | null
  mobile:           string | null
  email:            string | null
  billing_address:  string | null
  shipping_address: string | null
  city:             string | null
  state:            string | null
  pincode:          string | null
  place_of_supply:  string | null
  credit_period:    number
  credit_limit:     number
  is_active:        number
  created_at:       string
  updated_at:       string
}

export type CustomerFormData = {
  code:             string
  name:             string
  gstin:            string
  pan:              string
  contact_person:   string
  mobile:           string
  email:            string
  billing_address:  string
  shipping_address: string
  city:             string
  state:            string
  pincode:          string
  place_of_supply:  string
  credit_period:    number
  credit_limit:     number
}