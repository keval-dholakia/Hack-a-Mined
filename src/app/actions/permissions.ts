'use server'

import { createClient } from '@/lib/supabase/server'
import type { Permission, PermissionAction } from '@/constants/permissions'

export async function getPermissionsByRole(role_id: number): Promise<Permission[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('permissions')
    .select('module, page, can_view, can_create, can_edit, can_delete')
    .eq('role_id', role_id)

  if (error || !data) return []

  return data as Permission[]
}

export async function checkPermission(
  role_id: number,
  module:  string,
  page:    string,
  action:  PermissionAction
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('permissions')
    .select('can_view, can_create, can_edit, can_delete') // ← select all 4, not just one
    .eq('role_id', role_id)
    .eq('module', module)
    .eq('page', page)
    .single()

  if (error || !data) return false

  // Cast to Permission so TypeScript knows all 4 keys exist
  const row = data as Permission
  return row[action] === 1
}