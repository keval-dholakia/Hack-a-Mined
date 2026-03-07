export type UserRole = {
  id:             number
  role_name:      string
  description:    string
  is_super_admin: boolean
}

export type AuthUser = {
  id:            number
  name:          string
  email:         string
  role_id:       number
  is_active:     number
  last_login_at: string | null
  created_at:    string
  role:          UserRole
}

export type SessionUser = {
  id:            number
  name:          string
  email:         string
  is_super_admin: boolean
  role_name:     string
  role_id:       number
}