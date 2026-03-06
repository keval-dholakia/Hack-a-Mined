'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { SessionUser } from '@/types/auth'

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

  // Query 1 — get user row
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, email, role_id')
    .eq('email', user.email)
    .single()

  console.log('userData:', userData, 'userError:', userError)
  if (userError || !userData) return null

  // Query 2 — get role separately
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id, role_name, is_super_admin')
    .eq('id', userData.role_id)
    .single()

  console.log('roleData:', roleData, 'roleError:', roleError)
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