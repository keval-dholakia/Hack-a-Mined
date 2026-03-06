'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { WarehouseFormData } from '@/types/warehouse'

export async function getWarehouses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getWarehouseById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createWarehouse(formData: WarehouseFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('warehouses')
    .insert([{ ...formData, is_active: 1 }])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/warehouses')
  return { success: true }
}

export async function updateWarehouse(id: number, formData: WarehouseFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('warehouses')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/warehouses')
  return { success: true }
}

export async function toggleWarehouseStatus(id: number, is_active: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('warehouses')
    .update({ is_active: is_active === 1 ? 0 : 1 })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/warehouses')
  return { success: true }
}

export async function getWarehousesForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('id, name, code')
    .eq('is_active', 1)
    .order('name')

  if (error) return []
  return data
}