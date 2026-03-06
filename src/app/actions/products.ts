'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProductFormData } from '@/types/product'

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getProductById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createProduct(formData: ProductFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .insert([{ ...formData, is_active: 1, current_stock: 0 }])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/products')
  return { success: true }
}

export async function updateProduct(id: number, formData: ProductFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/products')
  return { success: true }
}

export async function toggleProductStatus(id: number, is_active: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_active: is_active === 1 ? 0 : 1 })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/masters/products')
  return { success: true }
}

export async function getProductsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, code, unit, gst_percent, sale_price, purchase_price, current_stock')
    .eq('is_active', 1)
    .order('name')

  if (error) return []
  return data
}