export type Permission = {
  id:         number
  role_id:    number
  module:     string
  page:       string
  can_view:   number  // smallint — 0 or 1
  can_create: number
  can_edit:   number
  can_delete: number
}

export type Role = {
  id:             number
  role_name:      string
  description:    string | null
  is_super_admin: boolean
}

export type UserPermissions = {
  role:        Role
  permissions: Permission[]
}