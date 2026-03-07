'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InvoiceFormData } from '@/types/invoice'

export async function getInvoices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(name, code),
      sale_order:sale_orders(so_no)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getInvoicesWithItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(name, code),
      sale_order:sale_orders(so_no),
      items:invoice_items(
        *,
        product:products(name, code, unit)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getInvoiceById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(name, code, credit_period, place_of_supply),
      sale_order:sale_orders(so_no),
      items:invoice_items(
        *,
        product:products(name, code, unit)
      )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createInvoice(formData: InvoiceFormData) {
  const supabase = await createClient()
  const { items, ...invoiceData } = formData

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([invoiceData])
    .select()
    .single()

  if (invoiceError) return { error: invoiceError.message }

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(items.map(item => ({ ...item, invoice_id: invoice.id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/sales/invoice')
  return { success: true, id: invoice.id }
}

export async function updateInvoice(id: number, formData: InvoiceFormData) {
  const supabase = await createClient()
  const { items, ...invoiceData } = formData

  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({ ...invoiceData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (invoiceError) return { error: invoiceError.message }

  await supabase.from('invoice_items').delete().eq('invoice_id', id)

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(items.map(item => ({ ...item, invoice_id: id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/sales/invoice')
  return { success: true }
}

export async function updateInvoicePaymentStatus(
  id: number,
  payment_status: 'Unpaid' | 'Partial' | 'Paid'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('invoices')
    .update({ payment_status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/sales/invoice')
  return { success: true }
}

export async function getInvoicesForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_no, customer_id, grand_total, customer:customers(name)')
    .neq('payment_status', 'Paid')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}