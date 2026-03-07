'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IQCFormData, PQCFormData } from '@/types/quality'

const IQC_PATH = '/dashboard/quality/iqc'

// ── IQC Entries ───────────────────────────────────────────

export async function getIQCEntries() {
  const supabase = await createClient()

  // Fetch IQC entries
  const { data: entries, error } = await supabase
    .from('iqc_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !entries) return []

  // Batch-fetch related data
  const grnIds      = [...new Set(entries.map(e => e.grn_id).filter(Boolean))]
  const productIds  = [...new Set(entries.map(e => e.product_id).filter(Boolean))]
  const checkerIds  = [...new Set(entries.map(e => e.checked_by).filter(Boolean))]

  const [{ data: grns }, { data: products }, { data: checkers }] = await Promise.all([
    supabase.from('grns').select('id, grn_no, vendor_id').in('id', grnIds.length ? grnIds : [0]),
    supabase.from('products').select('id, code, name').in('id', productIds.length ? productIds : [0]),
    supabase.from('users').select('id, name').in('id', checkerIds.length ? checkerIds : [0]),
  ])

  // Fetch vendor names for GRNs
  const vendorIds = [...new Set((grns ?? []).map((g: any) => g.vendor_id).filter(Boolean))]
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name')
    .in('id', vendorIds.length ? vendorIds : [0])

  // Build lookup maps
  const vendorMap  = Object.fromEntries((vendors  ?? []).map((v: any) => [v.id, v.name]))
  const grnMap     = Object.fromEntries((grns     ?? []).map((g: any) => [g.id, { grn_no: g.grn_no, vendor_name: vendorMap[g.vendor_id] ?? '—' }]))
  const productMap = Object.fromEntries((products ?? []).map((p: any) => [p.id, { code: p.code, name: p.name }]))
  const checkerMap = Object.fromEntries((checkers ?? []).map((u: any) => [u.id, u.name]))

  return entries.map(e => ({
    ...e,
    grn_no:       grnMap[e.grn_id]?.grn_no ?? '—',
    vendor_name:  grnMap[e.grn_id]?.vendor_name ?? '—',
    product_code: productMap[e.product_id]?.code ?? '—',
    product_name: productMap[e.product_id]?.name ?? '—',
    checker_name: e.checked_by ? (checkerMap[e.checked_by] ?? '—') : '—',
  }))
}

export async function getIQCById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('iqc_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  // Fetch joined names
  const [{ data: grn }, { data: product }, { data: checker }] = await Promise.all([
    supabase.from('grns').select('grn_no, vendor_id').eq('id', data.grn_id).single(),
    supabase.from('products').select('code, name').eq('id', data.product_id).single(),
    data.checked_by
      ? supabase.from('users').select('name').eq('id', data.checked_by).single()
      : Promise.resolve({ data: null }),
  ])

  let vendor_name = '—'
  if (grn?.vendor_id) {
    const { data: vendor } = await supabase.from('vendors').select('name').eq('id', grn.vendor_id).single()
    vendor_name = vendor?.name ?? '—'
  }

  return {
    ...data,
    grn_no:       grn?.grn_no ?? '—',
    vendor_name,
    product_code: product?.code ?? '—',
    product_name: product?.name ?? '—',
    checker_name: checker?.name ?? '—',
  }
}

export async function createIQCEntry(formData: IQCFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('iqc_entries').insert([formData])
  if (error) return { error: error.message }

  // Update GRN status to "IQC Done" after completing IQC
  await supabase.from('grns').update({ status: 'IQC Done' }).eq('id', formData.grn_id)

  revalidatePath(IQC_PATH)
  return { success: true }
}

export async function updateIQCEntry(id: number, formData: IQCFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('iqc_entries').update(formData).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(IQC_PATH)
  return { success: true }
}

export async function deleteIQCEntry(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('iqc_entries').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(IQC_PATH)
  return { success: true }
}

// ── GRN dropdown (Pending = awaiting IQC) ────────────────

export async function getGRNsForSelect() {
  const supabase = await createClient()

  const { data: grns, error } = await supabase
    .from('grns')
    .select('id, grn_no, vendor_id, gate_entry_date')
    .in('status', ['Pending', 'IQC Done'])   // show both so edits work
    .order('gate_entry_date', { ascending: false })

  if (error || !grns) return []

  const vendorIds = [...new Set(grns.map((g: any) => g.vendor_id).filter(Boolean))]
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name')
    .in('id', vendorIds.length ? vendorIds : [0])

  const vendorMap = Object.fromEntries((vendors ?? []).map((v: any) => [v.id, v.name]))

  return grns.map(g => ({
    id:               g.id,
    grn_no:           g.grn_no,
    vendor_name:      vendorMap[g.vendor_id] ?? '—',
    gate_entry_date:  g.gate_entry_date,
  }))
}

// ── GRN items (products inside a GRN) ────────────────────

export async function getGRNItems(grnId: number) {
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('grn_items')
    .select('id, grn_id, product_id, received_qty, accepted_qty, rejected_qty')
    .eq('grn_id', grnId)

  if (error || !items) return []

  const productIds = items.map(i => i.product_id).filter(Boolean)
  const { data: products } = await supabase
    .from('products')
    .select('id, code, name')
    .in('id', productIds.length ? productIds : [0])

  const productMap = Object.fromEntries((products ?? []).map((p: any) => [p.id, { code: p.code, name: p.name }]))

  return items.map(i => ({
    ...i,
    product_code: productMap[i.product_id]?.code ?? '—',
    product_name: productMap[i.product_id]?.name ?? '—',
  }))
}

// ── Users dropdown (for checked_by) ──────────────────────

export async function getUsersForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('is_active', 1)
    .order('name')

  if (error) return []
  return data ?? []
}

// ── Products for manual entry fallback ───────────────────

export async function getProductsForIQC() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, code, name')
    .eq('is_active', 1)
    .order('name')

  if (error) return []
  return data ?? []
}

// ════════════════════════════════════════════════════════════
// PQC — Process / Production Quality Control
// ════════════════════════════════════════════════════════════

const PQC_PATH = '/dashboard/quality/pqc'

export async function getPQCEntries() {
  const supabase = await createClient()

  const { data: entries, error } = await supabase
    .from('pqc_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !entries) return []

  const rcIds       = [...new Set(entries.map((e: any) => e.route_card_id).filter(Boolean))]
  const productIds  = [...new Set(entries.map((e: any) => e.product_id).filter(Boolean))]
  const operatorIds = [...new Set(entries.map((e: any) => e.operator_id).filter(Boolean))]

  const [{ data: rcs }, { data: products }, { data: operators }] = await Promise.all([
    supabase.from('route_cards').select('id, route_card_no, batch_no').in('id', rcIds.length ? rcIds : [0]),
    supabase.from('products').select('id, code, name').in('id', productIds.length ? productIds : [0]),
    supabase.from('users').select('id, name').in('id', operatorIds.length ? operatorIds : [0]),
  ])

  const rcMap       = Object.fromEntries((rcs       ?? []).map((r: any) => [r.id, { route_card_no: r.route_card_no, batch_no: r.batch_no }]))
  const productMap  = Object.fromEntries((products  ?? []).map((p: any) => [p.id, { code: p.code, name: p.name }]))
  const operatorMap = Object.fromEntries((operators ?? []).map((u: any) => [u.id, u.name]))

  return entries.map((e: any) => ({
    ...e,
    route_card_no: rcMap[e.route_card_id]?.route_card_no ?? '—',
    batch_no:      rcMap[e.route_card_id]?.batch_no      ?? '—',
    product_code:  productMap[e.product_id]?.code        ?? '—',
    product_name:  productMap[e.product_id]?.name        ?? '—',
    operator_name: e.operator_id ? (operatorMap[e.operator_id] ?? '—') : '—',
  }))
}

export async function getPQCById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pqc_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const [{ data: rc }, { data: product }, { data: operator }] = await Promise.all([
    supabase.from('route_cards').select('route_card_no, batch_no').eq('id', data.route_card_id).single(),
    supabase.from('products').select('code, name').eq('id', data.product_id).single(),
    data.operator_id
      ? supabase.from('users').select('name').eq('id', data.operator_id).single()
      : Promise.resolve({ data: null }),
  ])

  return {
    ...data,
    route_card_no: rc?.route_card_no  ?? '—',
    batch_no:      rc?.batch_no        ?? '—',
    product_code:  product?.code       ?? '—',
    product_name:  product?.name       ?? '—',
    operator_name: (operator as any)?.name ?? '—',
  }
}

export async function createPQCEntry(formData: PQCFormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('pqc_entries').insert([formData])
  if (error) return { error: error.message }
  revalidatePath(PQC_PATH)
  return { success: true }
}

export async function updatePQCEntry(id: number, formData: PQCFormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('pqc_entries').update(formData).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(PQC_PATH)
  return { success: true }
}

export async function deletePQCEntry(id: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('pqc_entries').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(PQC_PATH)
  return { success: true }
}

// ── Route Cards dropdown ──────────────────────────────────

export async function getRouteCardsForSelect() {
  const supabase = await createClient()

  const { data: rcs, error } = await supabase
    .from('route_cards')
    .select('id, route_card_no, batch_no, product_id, status')
    .in('status', ['Open', 'In Progress'])
    .order('created_at', { ascending: false })

  if (error || !rcs) return []

  const productIds = [...new Set(rcs.map((r: any) => r.product_id).filter(Boolean))]
  const { data: products } = await supabase
    .from('products')
    .select('id, code, name')
    .in('id', productIds.length ? productIds : [0])

  const productMap = Object.fromEntries((products ?? []).map((p: any) => [p.id, { code: p.code, name: p.name }]))

  return rcs.map((r: any) => ({
    id:           r.id,
    route_card_no: r.route_card_no,
    batch_no:     r.batch_no,
    product_id:   r.product_id,
    product_code: productMap[r.product_id]?.code ?? '—',
    product_name: productMap[r.product_id]?.name ?? '—',
    status:       r.status,
  }))
}
