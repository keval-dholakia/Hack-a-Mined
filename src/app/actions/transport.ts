'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TransportFormData } from '@/types/transport'

export async function getTransportMasters() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transport_masters')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getTransportMasterById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transport_masters')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createTransportMaster(formData: TransportFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transport_masters')
    .insert([{ ...formData, is_active: 1 }])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/transport')
  return { success: true }
}

export async function updateTransportMaster(id: number, formData: TransportFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transport_masters')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/transport')
  return { success: true }
}

export async function toggleTransportStatus(id: number, is_active: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transport_masters')
    .update({ is_active: is_active === 1 ? 0 : 1 })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/transport')
  return { success: true }
}

export async function getTransportForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transport_masters')
    .select('id, name, mobile')
    .eq('is_active', 1)
    .order('name')

  if (error) return []
  return data
}