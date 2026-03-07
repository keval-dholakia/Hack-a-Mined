'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  BOMFormData, RouteCardFormData,
  MaterialIssueFormData, ProductionReportFormData
} from '@/types/production'

// ── BOM ───────────────────────────────────────

export async function getBOMs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bom_headers')
    .select('*, product:products(name, code, unit)')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getBOMById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bom_headers')
    .select(`
      *,
      product:products(name, code, unit),
      items:bom_items(
        *,
        raw_material:products(name, code, unit)
      )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createBOM(formData: BOMFormData) {
  const supabase = await createClient()
  const { items, ...bomData } = formData

  const { data: bom, error: bomError } = await supabase
    .from('bom_headers')
    .insert([{ ...bomData, is_active: 1 }])
    .select()
    .single()

  if (bomError) return { error: bomError.message }

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('bom_items')
      .insert(items.map(item => ({ ...item, bom_id: bom.id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/production/bom')
  return { success: true, id: bom.id }
}

export async function updateBOM(id: number, formData: BOMFormData) {
  const supabase = await createClient()
  const { items, ...bomData } = formData

  const { error: bomError } = await supabase
    .from('bom_headers')
    .update({ ...bomData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (bomError) return { error: bomError.message }

  await supabase.from('bom_items').delete().eq('bom_id', id)

  if (items.length > 0) {
    const { error: itemsError } = await supabase
      .from('bom_items')
      .insert(items.map(item => ({ ...item, bom_id: id })))

    if (itemsError) return { error: itemsError.message }
  }

  revalidatePath('/dashboard/production/bom')
  return { success: true }
}

export async function getBOMsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bom_headers')
    .select('id, product_id, version, process_name')
    .eq('is_active', 1)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ── Route Cards ───────────────────────────────

export async function getRouteCards() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('route_cards')
    .select('*, product:products(name, code, unit), bom:bom_headers(version, process_name)')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getRouteCardById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('route_cards')
    .select('*, product:products(name, code, unit), bom:bom_headers(version, process_name)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createRouteCard(formData: RouteCardFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('route_cards')
    .insert([formData])

  if (error) return { error: error.message }

  revalidatePath('/dashboard/production/route-card')
  return { success: true }
}

export async function updateRouteCard(id: number, formData: RouteCardFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('route_cards')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/production/route-card')
  return { success: true }
}

export async function getRouteCardsForSelect() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('route_cards')
    .select('id, route_card_no, product_id, product:products(name)')
    .in('status', ['Open', 'In Progress'])
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ── Material Issues ───────────────────────────

export async function getMaterialIssues() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('material_issues')
    .select(`
      *,
      route_card:route_cards(route_card_no),
      product:products(name, code, unit),
      warehouse:warehouses(name)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getMaterialIssueById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('material_issues')
    .select(`
      *,
      route_card:route_cards(route_card_no),
      product:products(name, code, unit),
      warehouse:warehouses(name)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createMaterialIssue(formData: MaterialIssueFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('material_issues')
    .insert([formData])

  if (error) return { error: error.message }

  // Auto-update route card status to In Progress
  await supabase
    .from('route_cards')
    .update({ status: 'In Progress', updated_at: new Date().toISOString() })
    .eq('id', formData.route_card_id)
    .eq('status', 'Open')

  revalidatePath('/dashboard/production/material-issue')
  revalidatePath('/dashboard/production/route-card')
  return { success: true }
}

// ── Production Reports ────────────────────────

export async function getProductionReports() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('production_reports')
    .select(`
      *,
      route_card:route_cards(route_card_no),
      product:products(name, code, unit),
      operator:users(name)
    `)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getProductionReportById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('production_reports')
    .select(`
      *,
      route_card:route_cards(route_card_no),
      product:products(name, code, unit),
      operator:users(name)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createProductionReport(formData: ProductionReportFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('production_reports')
    .insert([formData])

  if (error) return { error: error.message }

  // Update route card produced_qty
  if (formData.route_card_id) {
    const { data: rc } = await supabase
      .from('route_cards')
      .select('produced_qty, rejection_qty, plan_qty')
      .eq('id', formData.route_card_id)
      .single()

    if (rc) {
      const newProduced  = Number(rc.produced_qty)  + Number(formData.production_qty)
      const newRejection = Number(rc.rejection_qty) + Number(formData.rejection_qty)
      const isComplete   = newProduced >= Number(rc.plan_qty)

      await supabase
        .from('route_cards')
        .update({
          produced_qty:  newProduced,
          rejection_qty: newRejection,
          status:        isComplete ? 'Closed' : 'In Progress',
          closed_date:   isComplete ? new Date().toISOString().split('T')[0] : null,
          updated_at:    new Date().toISOString(),
        })
        .eq('id', formData.route_card_id)
    }
  }

  revalidatePath('/dashboard/production/report')
  revalidatePath('/dashboard/production/route-card')
  return { success: true }
}

export async function updateProductionReport(id: number, formData: ProductionReportFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('production_reports')
    .update({ ...formData })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/production/report')
  return { success: true }
}