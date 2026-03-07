'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { SessionUser } from '@/types/auth'
import type { Permission } from '@/constants/permissions'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, email, role_id')
    .eq('email', user.email)
    .single()

  if (userError || !userData) return null

  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id, role_name, is_super_admin')
    .eq('id', userData.role_id)
    .single()

  if (roleError || !roleData) return null

  return {
    id:             userData.id,
    name:           userData.name,
    email:          userData.email,
    role_id:        userData.role_id,
    role_name:      roleData.role_name,
    is_super_admin: roleData.is_super_admin,
  }
}

// Returns session user + their full permissions array in one call
export async function getSessionUserWithPermissions(): Promise<{
  user:        SessionUser
  permissions: Permission[]
} | null> {
  const supabase = await createClient()

  const user = await getSessionUser()
  if (!user) return null

  // Super admin — skip DB query, return empty array
  // (middleware already bypasses checks for is_super_admin)
  if (user.is_super_admin) {
    return { user, permissions: [] }
  }

  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('module, page, can_view, can_create, can_edit, can_delete')
    .eq('role_id', user.role_id)

  if (error) return { user, permissions: [] }

  return {
    user,
    permissions: permissions as Permission[],
  }
}