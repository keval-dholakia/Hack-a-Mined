'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { VendorFormData } from '@/types/vendor'

export async function getVendors() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getVendorById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createVendor(formData: VendorFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('vendors')
    .insert([{ ...formData, is_active: 1 }])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/vendors')
  return { success: true }
}

export async function updateVendor(id: number, formData: VendorFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('vendors')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/vendors')
  return { success: true }
}

export async function toggleVendorStatus(id: number, is_active: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('vendors')
    .update({ is_active: is_active === 1 ? 0 : 1 })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/vendors')
  return { success: true }
}

export async function getVendorsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vendors')
    .select('id, name, code, payment_terms')
    .eq('is_active', 1)
    .order('name')

  if (error) return []
  return data
}