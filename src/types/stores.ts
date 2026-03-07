// ─── Warehouse Master (re-exported for convenience) ──────────────────────────
export type { Warehouse, WarehouseFormData } from './warehouse'

// ─── Warehouse Opening Stock ──────────────────────────────────────────────────
export type WarehouseOpeningRow = {
    id: number
    warehouse_id: number
    product_id: number
    opening_qty: number
    opening_value: number
    opening_date: string
    remarks: string | null
    created_at: string
    // joined
    warehouse_name?: string
    product_name?: string
    product_code?: string
}

export type WarehouseOpeningFormData = {
    warehouse_id: string
    product_id: string
    opening_qty: string
    opening_value: string
    opening_date: string
    remarks: string
}

// ─── Dispatch SRV ────────────────────────────────────────────────────────────
export type DispatchSRV = {
    id: number
    srv_no: string
    srv_date: string
    party_name: string | null
    product_id: number
    qty: number
    returnable: number        // 0 = No, 1 = Yes
    return_by_date: string | null
    remarks: string | null
    created_at: string
    // joined
    product_name?: string
    product_code?: string
}

export type DispatchSRVFormData = {
    srv_no: string
    srv_date: string
    party_name: string
    product_id: string
    qty: string
    returnable: string        // '0' | '1'
    return_by_date: string
    remarks: string
}

// ─── Stock Transfer ───────────────────────────────────────────────────────────
export type StockTransfer = {
    id: number
    transfer_no: string
    from_warehouse_id: number
    to_warehouse_id: number
    product_id: number
    qty: number
    transfer_date: string
    remarks: string | null
    created_at: string
    // joined
    from_warehouse_name?: string
    to_warehouse_name?: string
    product_name?: string
    product_code?: string
}

export type StockTransferFormData = {
    transfer_no: string
    from_warehouse_id: string
    to_warehouse_id: string
    product_id: string
    qty: string
    transfer_date: string
    remarks: string
}

// ─── Material Receipt ─────────────────────────────────────────────────────────
export type MaterialReceipt = {
    id: number
    receipt_no: string
    source_doc_ref: string | null
    transfer_id: number | null
    warehouse_id: number
    product_id: number
    qty_received: number
    receipt_date: string
    remarks: string | null
    created_at: string
    // joined
    warehouse_name?: string
    product_name?: string
    product_code?: string
    transfer_no?: string
}

export type MaterialReceiptFormData = {
    receipt_no: string
    source_doc_ref: string
    transfer_id: string
    warehouse_id: string
    product_id: string
    qty_received: string
    receipt_date: string
    remarks: string
}
