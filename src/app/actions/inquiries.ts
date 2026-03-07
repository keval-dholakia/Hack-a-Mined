'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InquiryFormData } from '@/types/inquiry'

export async function getInquiries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      customer:customers(name, code),
      sales_person:users(name)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getInquiriesWithItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      customer:customers(name, code),
      sales_person:users(name),
      items:inquiry_items(
        *,
        product:products(name, code)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getInquiryById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      customer:customers(name, code),
      sales_person:users(name),
      items:inquiry_items(
        *,
        product:products(name, code, unit)
      )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createInquiry(formData: InquiryFormData) {
  const supabase = await createClient()

  const { items, ...inquiryData } = formData

  const { data: inquiry, error: inquiryError } = await supabase
    .from('inquiries')
    .insert([inquiryData])
    .select()
    .single()

  if (inquiryError) return { error: inquiryError.message }

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('inquiry_items')
      .insert(items.map(item => ({ ...item, inquiry_id: inquiry.id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/sales/inquiry')
  return { success: true, id: inquiry.id }
}

export async function updateInquiry(id: number, formData: InquiryFormData) {
  const supabase = await createClient()

  const { items, ...inquiryData } = formData

  const { error: inquiryError } = await supabase
    .from('inquiries')
    .update({ ...inquiryData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (inquiryError) return { error: inquiryError.message }

  // Delete existing items and re-insert
  await supabase.from('inquiry_items').delete().eq('inquiry_id', id)

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('inquiry_items')
      .insert(items.map(item => ({ ...item, inquiry_id: id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/sales/inquiry')
  return { success: true }
}

export async function updateInquiryStatus(
  id: number,
  status: 'New' | 'Processing' | 'Quoted' | 'Lost'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('inquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/sales/inquiry')
  return { success: true }
}

export async function getInquiriesForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select('id, inquiry_no, customer_id, customer:customers(name)')
    .eq('status', 'Quoted')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}