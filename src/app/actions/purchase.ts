'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  POFormData, GRNFormData, IQCFormData, PurchaseBillFormData
} from '@/types/purchase'

// ── Purchase Orders ───────────────────────────

export async function getPurchaseOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, vendor:vendors(name, code)')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getPurchaseOrderById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      vendor:vendors(name, code),
      items:po_items(*, product:products(name, code, unit))
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createPurchaseOrder(formData: POFormData) {
  const supabase = await createClient()
  const { items, ...poData } = formData

  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert([poData])
    .select()
    .single()

  if (poError) return { error: poError.message }

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('po_items')
      .insert(items.map(item => ({ ...item, po_id: po.id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/purchase/po')
  return { success: true, id: po.id }
}

export async function updatePurchaseOrder(id: number, formData: POFormData) {
  const supabase = await createClient()
  const { items, ...poData } = formData

  const { error: poError } = await supabase
    .from('purchase_orders')
    .update({ ...poData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (poError) return { error: poError.message }

  await supabase.from('po_items').delete().eq('po_id', id)

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('po_items')
      .insert(items.map(item => ({ ...item, po_id: id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/purchase/po')
  return { success: true }
}

export async function getPOsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('id, po_no, vendor_id, vendor:vendors(name)')
    .in('status', ['Open', 'Partial'])
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ── GRNs ─────────────────────────────────────

export async function getGRNs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('grns')
    .select(`
      *,
      vendor:vendors(name, code),
      purchase_order:purchase_orders(po_no),
      warehouse:warehouses(name)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getGRNById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('grns')
    .select(`
      *,
      vendor:vendors(name, code),
      purchase_order:purchase_orders(po_no),
      warehouse:warehouses(name),
      items:grn_items(*, product:products(name, code, unit))
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createGRN(formData: GRNFormData) {
  const supabase = await createClient()
  const { items, ...grnData } = formData

  const { data: grn, error: grnError } = await supabase
    .from('grns')
    .insert([grnData])
    .select()
    .single()

  if (grnError) return { error: grnError.message }

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('grn_items')
      .insert(items.map(item => ({ ...item, grn_id: grn.id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/purchase/grn')
  return { success: true, id: grn.id }
}

export async function updateGRN(id: number, formData: GRNFormData) {
  const supabase = await createClient()
  const { items, ...grnData } = formData

  const { error: grnError } = await supabase
    .from('grns')
    .update({ ...grnData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (grnError) return { error: grnError.message }

  await supabase.from('grn_items').delete().eq('grn_id', id)

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('grn_items')
      .insert(items.map(item => ({ ...item, grn_id: id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/purchase/grn')
  return { success: true }
}

export async function getGRNsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('grns')
    .select('id, grn_no, vendor_id')
    .in('status', ['Pending', 'IQC Done'])
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ── IQC ──────────────────────────────────────

export async function getIQCEntries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('iqc_entries')
    .select(`
      *,
      grn:grns(grn_no),
      product:products(name, code, unit)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getIQCById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('iqc_entries')
    .select(`
      *,
      grn:grns(grn_no),
      product:products(name, code, unit)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createIQC(formData: IQCFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('iqc_entries')
    .insert([formData])

  if (error) return { error: error.message }

  // Update GRN status to IQC Done
  await supabase
    .from('grns')
    .update({ status: 'IQC Done', updated_at: new Date().toISOString() })
    .eq('id', formData.grn_id)

  revalidatePath('/dashboard/purchase/iqc')
  revalidatePath('/dashboard/purchase/grn')
  return { success: true }
}

// ── Purchase Bills ────────────────────────────

export async function getPurchaseBills() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchase_bills')
    .select(`
      *,
      vendor:vendors(name, code),
      grn:grns(grn_no)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getPurchaseBillById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchase_bills')
    .select(`
      *,
      vendor:vendors(name, code),
      grn:grns(grn_no)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createPurchaseBill(formData: PurchaseBillFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('purchase_bills')
    .insert([formData])

  if (error) return { error: error.message }

  // Mark GRN as fully Received
  if (formData.grn_id) {
    await supabase
      .from('grns')
      .update({ status: 'Received', updated_at: new Date().toISOString() })
      .eq('id', formData.grn_id)
  }

  revalidatePath('/dashboard/purchase/billbook')
  revalidatePath('/dashboard/purchase/grn')
  return { success: true }
}

export async function updatePurchaseBill(id: number, formData: PurchaseBillFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('purchase_bills')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/purchase/billbook')
  return { success: true }
}