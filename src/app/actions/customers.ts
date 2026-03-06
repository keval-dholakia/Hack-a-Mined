'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CustomerFormData } from '@/types/customer'

export async function getCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getCustomerById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createCustomer(formData: CustomerFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .insert([{ ...formData, is_active: 1 }])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/customers')
  return { success: true }
}

export async function updateCustomer(id: number, formData: CustomerFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/customers')
  return { success: true }
}

export async function toggleCustomerStatus(id: number, is_active: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .update({ is_active: is_active === 1 ? 0 : 1 })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/customers')
  return { success: true }
}

export async function getCustomersForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, code, credit_period, billing_address, shipping_address')
    .eq('is_active', 1)
    .order('name')

  if (error) return []
  return data
}