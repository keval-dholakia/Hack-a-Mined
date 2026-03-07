'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SaleOrderFormData } from '@/types/saleOrder'

export async function getSaleOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sale_orders')
    .select(`
      *,
      customer:customers(name, code),
      transporter:transport_masters(name)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getSaleOrdersWithItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sale_orders')
    .select(`
      *,
      customer:customers(name, code),
      transporter:transport_masters(name),
      items:sale_order_items(
        *,
        product:products(name, code, unit)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getSaleOrderById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sale_orders')
    .select(`
      *,
      customer:customers(name, code, billing_address, shipping_address),
      inquiry:inquiries(inquiry_no),
      transporter:transport_masters(name),
      items:sale_order_items(
        *,
        product:products(name, code, unit)
      )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createSaleOrder(formData: SaleOrderFormData) {
  const supabase = await createClient()
  const { items, ...soData } = formData

  const { data: so, error: soError } = await supabase
    .from('sale_orders')
    .insert([soData])
    .select()
    .single()

  if (soError) return { error: soError.message }

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('sale_order_items')
      .insert(items.map(item => ({ ...item, so_id: so.id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/sales/sale-order')
  return { success: true, id: so.id }
}

export async function updateSaleOrder(id: number, formData: SaleOrderFormData) {
  const supabase = await createClient()
  const { items, ...soData } = formData

  const { error: soError } = await supabase
    .from('sale_orders')
    .update({ ...soData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (soError) return { error: soError.message }

  await supabase.from('sale_order_items').delete().eq('so_id', id)

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('sale_order_items')
      .insert(items.map(item => ({ ...item, so_id: id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/sales/sale-order')
  return { success: true }
}

export async function updateSaleOrderStatus(
  id: number,
  status: 'Pending' | 'Dispatched' | 'Closed'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sale_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/sales/sale-order')
  return { success: true }
}

export async function getSaleOrdersForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sale_orders')
    .select('id, so_no, customer_id, customer:customers(name)')
    .eq('status', 'Pending')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}