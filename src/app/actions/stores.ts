'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
    WarehouseOpeningFormData,
    DispatchSRVFormData,
    StockTransferFormData,
    MaterialReceiptFormData,
} from '@/types/stores'

// ─────────────────────────────────────────────────────────────────────────────
// 10.2  WAREHOUSE OPENING STOCK
// Table: stock_ledger (txn_type = 'Opening')
// ─────────────────────────────────────────────────────────────────────────────

export async function getOpeningStocks() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('stock_ledger')
        .select(`
      id,
      warehouse_id,
      product_id,
      qty_in,
      txn_date,
      remarks,
      created_at,
      warehouses ( name ),
      products   ( name, code )
    `)
        .eq('txn_type', 'Opening')
        .order('created_at', { ascending: false })

    if (error) return []

    return (data ?? []).map((r: any) => ({
        id: r.id,
        warehouse_id: r.warehouse_id,
        product_id: r.product_id,
        opening_qty: r.qty_in,
        opening_value: 0,               // stock_ledger has no value column; extend if needed
        opening_date: r.txn_date,
        remarks: r.remarks,
        created_at: r.created_at,
        warehouse_name: r.warehouses?.name,
        product_name: r.products?.name,
        product_code: r.products?.code,
    }))
}

export async function createOpeningStock(form: WarehouseOpeningFormData) {
    const supabase = await createClient()

    // 1. Insert into stock_ledger
    const { error } = await supabase.from('stock_ledger').insert([{
        product_id: parseInt(form.product_id),
        warehouse_id: parseInt(form.warehouse_id),
        txn_date: form.opening_date || new Date().toISOString().slice(0, 10),
        txn_type: 'Opening',
        ref_no: 'OPENING',
        qty_in: parseFloat(form.opening_qty) || 0,
        qty_out: 0,
        balance_qty: parseFloat(form.opening_qty) || 0,
        remarks: form.remarks || null,
    }])

    if (error) return { error: error.message }

    // 2. Update product current_stock
    const { data: prod } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', parseInt(form.product_id))
        .single()

    if (prod) {
        await supabase
            .from('products')
            .update({ current_stock: (prod.current_stock || 0) + parseFloat(form.opening_qty) })
            .eq('id', parseInt(form.product_id))
    }

    revalidatePath('/dashboard/stores/opening-stock')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10.3  DISPATCH SRV
// Table: dispatch_srvs
// ─────────────────────────────────────────────────────────────────────────────

export async function getDispatchSRVs() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('dispatch_srvs')
        .select(`
      id,
      srv_no,
      srv_date,
      party_name,
      product_id,
      qty,
      returnable,
      return_by_date,
      remarks,
      created_at,
      products ( name, code )
    `)
        .order('created_at', { ascending: false })

    if (error) return []

    return (data ?? []).map((r: any) => ({
        id: r.id,
        srv_no: r.srv_no,
        srv_date: r.srv_date,
        party_name: r.party_name,
        product_id: r.product_id,
        qty: r.qty,
        returnable: r.returnable,
        return_by_date: r.return_by_date,
        remarks: r.remarks,
        created_at: r.created_at,
        product_name: r.products?.name,
        product_code: r.products?.code,
    }))
}

export async function getDispatchSRVById(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('dispatch_srvs')
        .select('*')
        .eq('id', id)
        .single()
    if (error) return null
    return data
}

export async function createDispatchSRV(form: DispatchSRVFormData) {
    const supabase = await createClient()
    const { error } = await supabase.from('dispatch_srvs').insert([{
        srv_no: form.srv_no,
        srv_date: form.srv_date || new Date().toISOString().slice(0, 10),
        party_name: form.party_name || null,
        product_id: parseInt(form.product_id),
        qty: parseFloat(form.qty),
        returnable: parseInt(form.returnable) || 0,
        return_by_date: form.returnable === '1' && form.return_by_date ? form.return_by_date : null,
        remarks: form.remarks || null,
    }])

    if (error) return { error: error.message }

    // Insert outgoing stock ledger entry
    await supabase.from('stock_ledger').insert([{
        product_id: parseInt(form.product_id),
        txn_date: form.srv_date || new Date().toISOString().slice(0, 10),
        txn_type: 'Dispatch SRV',
        ref_no: form.srv_no,
        qty_in: 0,
        qty_out: parseFloat(form.qty),
        balance_qty: 0,
        remarks: form.remarks || null,
    }])

    revalidatePath('/dashboard/stores/dispatch-srv')
    return { success: true }
}

export async function updateDispatchSRV(id: number, form: DispatchSRVFormData) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('dispatch_srvs')
        .update({
            srv_no: form.srv_no,
            srv_date: form.srv_date,
            party_name: form.party_name || null,
            product_id: parseInt(form.product_id),
            qty: parseFloat(form.qty),
            returnable: parseInt(form.returnable) || 0,
            return_by_date: form.returnable === '1' && form.return_by_date ? form.return_by_date : null,
            remarks: form.remarks || null,
        })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard/stores/dispatch-srv')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10.4  STOCK TRANSFER
// Table: stock_transfers
// ─────────────────────────────────────────────────────────────────────────────

export async function getStockTransfers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('stock_transfers')
        .select(`
      id,
      transfer_no,
      from_warehouse_id,
      to_warehouse_id,
      product_id,
      qty,
      transfer_date,
      remarks,
      created_at,
      products ( name, code )
    `)
        .order('created_at', { ascending: false })

    if (error) return []

    // Fetch warehouse names separately due to two FKs on same table
    const warehouseIds = [
        ...new Set((data ?? []).flatMap((r: any) => [r.from_warehouse_id, r.to_warehouse_id])),
    ]
    let warehouseMap: Record<number, string> = {}
    if (warehouseIds.length > 0) {
        const { data: wh } = await supabase
            .from('warehouses')
            .select('id, name')
            .in('id', warehouseIds)
            ; (wh ?? []).forEach((w: any) => { warehouseMap[w.id] = w.name })
    }

    return (data ?? []).map((r: any) => ({
        id: r.id,
        transfer_no: r.transfer_no,
        from_warehouse_id: r.from_warehouse_id,
        to_warehouse_id: r.to_warehouse_id,
        product_id: r.product_id,
        qty: r.qty,
        transfer_date: r.transfer_date,
        remarks: r.remarks,
        created_at: r.created_at,
        from_warehouse_name: warehouseMap[r.from_warehouse_id] ?? '',
        to_warehouse_name: warehouseMap[r.to_warehouse_id] ?? '',
        product_name: r.products?.name,
        product_code: r.products?.code,
    }))
}

export async function getStockTransferById(id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('stock_transfers')
        .select('*')
        .eq('id', id)
        .single()
    if (error) return null
    return data
}

export async function createStockTransfer(form: StockTransferFormData) {
    const supabase = await createClient()

    if (form.from_warehouse_id === form.to_warehouse_id) {
        return { error: 'From and To warehouse cannot be the same.' }
    }

    const { data: inserted, error } = await supabase
        .from('stock_transfers')
        .insert([{
            transfer_no: form.transfer_no,
            from_warehouse_id: parseInt(form.from_warehouse_id),
            to_warehouse_id: parseInt(form.to_warehouse_id),
            product_id: parseInt(form.product_id),
            qty: parseFloat(form.qty),
            transfer_date: form.transfer_date || new Date().toISOString().slice(0, 10),
            remarks: form.remarks || null,
        }])
        .select()
        .single()

    if (error) return { error: error.message }

    // Stock ledger – OUT from source, IN to destination
    const txnDate = form.transfer_date || new Date().toISOString().slice(0, 10)
    await supabase.from('stock_ledger').insert([
        {
            product_id: parseInt(form.product_id),
            warehouse_id: parseInt(form.from_warehouse_id),
            txn_date: txnDate,
            txn_type: 'Transfer Out',
            ref_no: form.transfer_no,
            qty_in: 0,
            qty_out: parseFloat(form.qty),
            balance_qty: 0,
            remarks: form.remarks || null,
        },
        {
            product_id: parseInt(form.product_id),
            warehouse_id: parseInt(form.to_warehouse_id),
            txn_date: txnDate,
            txn_type: 'Transfer In',
            ref_no: form.transfer_no,
            qty_in: parseFloat(form.qty),
            qty_out: 0,
            balance_qty: 0,
            remarks: form.remarks || null,
        },
    ])

    revalidatePath('/dashboard/stores/stock-transfer')
    return { success: true, id: inserted?.id }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10.5  MATERIAL RECEIPT
// Stored in stock_ledger (txn_type = 'Transfer In' or 'Material Receipt')
// and linked to a stock_transfer via ref_no
// ─────────────────────────────────────────────────────────────────────────────

export async function getMaterialReceipts() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('stock_ledger')
        .select(`
      id,
      warehouse_id,
      product_id,
      txn_date,
      ref_no,
      qty_in,
      remarks,
      created_at,
      warehouses ( name ),
      products   ( name, code )
    `)
        .eq('txn_type', 'Material Receipt')
        .order('created_at', { ascending: false })

    if (error) return []

    return (data ?? []).map((r: any) => ({
        id: r.id,
        warehouse_id: r.warehouse_id,
        product_id: r.product_id,
        receipt_date: r.txn_date,
        source_doc_ref: r.ref_no,
        qty_received: r.qty_in,
        remarks: r.remarks,
        created_at: r.created_at,
        warehouse_name: r.warehouses?.name,
        product_name: r.products?.name,
        product_code: r.products?.code,
    }))
}

export async function getStockTransfersForSelect() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('stock_transfers')
        .select('id, transfer_no, to_warehouse_id, product_id, qty')
        .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
}

export async function createMaterialReceipt(form: MaterialReceiptFormData) {
    const supabase = await createClient()

    const { error } = await supabase.from('stock_ledger').insert([{
        product_id: parseInt(form.product_id),
        warehouse_id: parseInt(form.warehouse_id),
        txn_date: form.receipt_date || new Date().toISOString().slice(0, 10),
        txn_type: 'Material Receipt',
        ref_no: form.source_doc_ref || (form.transfer_id ? `ST-${form.transfer_id}` : ''),
        qty_in: parseFloat(form.qty_received),
        qty_out: 0,
        balance_qty: parseFloat(form.qty_received),
        remarks: form.remarks || null,
    }])

    if (error) return { error: error.message }

    revalidatePath('/dashboard/stores/material-receipt')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

export async function getProductsForSelect() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select('id, name, code, unit, current_stock')
        .eq('is_active', 1)
        .order('name')
    if (error) return []
    return data ?? []
}
