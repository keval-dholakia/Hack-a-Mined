'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createMaterialReceipt } from '@/app/actions/stores'
import type { MaterialReceiptFormData } from '@/types/stores'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'

type Warehouse = { id: number; name: string; code?: string | null }
type SelectItem = { id: number; name: string; code?: string | null; unit?: string | null }
type Transfer = { id: number; transfer_no: string; to_warehouse_id: number; product_id: number; qty: number }

type Props = {
    warehouses: Warehouse[]
    products: SelectItem[]
    transfers: Transfer[]
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY: MaterialReceiptFormData = {
    receipt_no: '',
    source_doc_ref: '',
    transfer_id: '',
    warehouse_id: '',
    product_id: '',
    qty_received: '',
    receipt_date: today,
    remarks: '',
}

export default function MaterialReceiptForm({ warehouses, products, transfers }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const prefillTransferId = searchParams.get('transfer_id')

    const [form, setForm] = useState<MaterialReceiptFormData>({ ...EMPTY, transfer_id: prefillTransferId ?? '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Auto-fill when transfer is selected
    useEffect(() => {
        if (!form.transfer_id) return
        const t = transfers.find(t => t.id === parseInt(form.transfer_id))
        if (t) {
            setForm(prev => ({
                ...prev,
                source_doc_ref: t.transfer_no,
                warehouse_id: t.to_warehouse_id.toString(),
                product_id: t.product_id.toString(),
                qty_received: t.qty.toString(),
            }))
        }
    }, [form.transfer_id, transfers])

    function set(key: keyof MaterialReceiptFormData, value: string) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const result = await createMaterialReceipt(form)
        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }
        router.push('/dashboard/stores/material-receipt')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>New Material Receipt</h1>
                    <p className={styles.subtitle}>Record incoming stock from transfer or external source</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>

                    <Card title="Receipt Header">
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>Receipt No <span className={styles.req}>*</span></label>
                                <input
                                    required
                                    placeholder="e.g. MR-001"
                                    value={form.receipt_no}
                                    onChange={e => set('receipt_no', e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Receipt Date</label>
                                <input
                                    type="date"
                                    value={form.receipt_date}
                                    onChange={e => set('receipt_date', e.target.value)}
                                />
                            </div>

                            <div className={`${styles.field} ${styles.span2}`}>
                                <label>Link Stock Transfer (optional)</label>
                                <select
                                    value={form.transfer_id}
                                    onChange={e => set('transfer_id', e.target.value)}
                                >
                                    <option value="">— None / Manual Entry —</option>
                                    {transfers.map(t => (
                                        <option key={t.id} value={t.id}>{t.transfer_no} (qty: {t.qty})</option>
                                    ))}
                                </select>
                            </div>

                            <div className={`${styles.field} ${styles.span2}`}>
                                <label>Source Document Ref</label>
                                <input
                                    placeholder="e.g. ST-001, PO-023"
                                    value={form.source_doc_ref}
                                    onChange={e => set('source_doc_ref', e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card title="Item Details">
                        <div className={styles.fields}>
                            <div className={`${styles.field} ${styles.span2}`}>
                                <label>Receiving Warehouse <span className={styles.req}>*</span></label>
                                <select
                                    required
                                    value={form.warehouse_id}
                                    onChange={e => set('warehouse_id', e.target.value)}
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={`${styles.field} ${styles.span2}`}>
                                <label>Item / Product <span className={styles.req}>*</span></label>
                                <select
                                    required
                                    value={form.product_id}
                                    onChange={e => set('product_id', e.target.value)}
                                >
                                    <option value="">Select product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            [{p.code ?? 'N/A'}] {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label>Qty Received <span className={styles.req}>*</span></label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    required
                                    placeholder="0"
                                    value={form.qty_received}
                                    onChange={e => set('qty_received', e.target.value)}
                                />
                            </div>

                            <div className={`${styles.field} ${styles.span2}`}>
                                <label>Remarks</label>
                                <textarea
                                    rows={3}
                                    placeholder="Optional notes..."
                                    value={form.remarks}
                                    onChange={e => set('remarks', e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.footer}>
                    <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Receipt'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
