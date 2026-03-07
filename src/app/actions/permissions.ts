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
    .select('can_view, can_create, can_edit, can_delete')
    .eq('role_id', role_id)
    .eq('module', module)
    .eq('page', page)
    .single()

  if (error || !data) return false

  const row = data as Permission
  return row[action] === 1
}

// ── Client-side helpers (no DB call, use cached permissions array) ──

export async function hasViewAccess(
  permissions: Permission[], module: string, page: string
): Promise<boolean> {
  return permissions.some(
    p => p.module === module && p.page === page && p.can_view === 1
  )
}

export async function hasCreateAccess(
  permissions: Permission[], module: string, page: string
): Promise<boolean> {
  return permissions.some(
    p => p.module === module && p.page === page && p.can_create === 1
  )
}

export async function hasEditAccess(
  permissions: Permission[], module: string, page: string
): Promise<boolean> {
  return permissions.some(
    p => p.module === module && p.page === page && p.can_edit === 1
  )
}

export async function hasDeleteAccess(
  permissions: Permission[], module: string, page: string
): Promise<boolean> {
  return permissions.some(
    p => p.module === module && p.page === page && p.can_delete === 1
  )
}

export async function getAccessiblePages(
  permissions: Permission[], module: string
): Promise<string[]> {
  return permissions
    .filter(p => p.module === module && p.can_view === 1)
    .map(p => p.page)
}