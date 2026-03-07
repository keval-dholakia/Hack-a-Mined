'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStockTransfer } from '@/app/actions/stores'
import type { StockTransferFormData } from '@/types/stores'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'

type Warehouse = { id: number; name: string; code?: string | null }
type SelectItem = { id: number; name: string; code?: string | null; unit?: string | null; current_stock?: number }

type Props = {
    warehouses: Warehouse[]
    products: SelectItem[]
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY: StockTransferFormData = {
    transfer_no: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    product_id: '',
    qty: '',
    transfer_date: today,
    remarks: '',
}

export default function StockTransferForm({ warehouses, products }: Props) {
    const router = useRouter()
    const [form, setForm] = useState<StockTransferFormData>(EMPTY)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const selectedProduct = products.find(p => p.id === parseInt(form.product_id))

    function set(key: keyof StockTransferFormData, value: string) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (form.from_warehouse_id === form.to_warehouse_id) {
            setError('Source and destination warehouse cannot be the same.')
            return
        }
        setLoading(true)
        setError(null)
        const result = await createStockTransfer(form)
        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }
        router.push('/dashboard/stores/stock-transfer')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>New Stock Transfer</h1>
                    <p className={styles.subtitle}>Move inventory between warehouses</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>

                    <Card title="Transfer Header">
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>Transfer No <span className={styles.req}>*</span></label>
                                <input
                                    required
                                    placeholder="e.g. ST-001"
                                    value={form.transfer_no}
                                    onChange={e => set('transfer_no', e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Transfer Date</label>
                                <input
                                    type="date"
                                    value={form.transfer_date}
                                    onChange={e => set('transfer_date', e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label>From Warehouse <span className={styles.req}>*</span></label>
                                <select
                                    required
                                    value={form.from_warehouse_id}
                                    onChange={e => set('from_warehouse_id', e.target.value)}
                                >
                                    <option value="">Select source</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label>To Warehouse <span className={styles.req}>*</span></label>
                                <select
                                    required
                                    value={form.to_warehouse_id}
                                    onChange={e => set('to_warehouse_id', e.target.value)}
                                >
                                    <option value="">Select destination</option>
                                    {warehouses
                                        .filter(w => w.id.toString() !== form.from_warehouse_id)
                                        .map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card title="Item Details">
                        <div className={styles.fields}>
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

                            {selectedProduct && (
                                <div className={`${styles.field} ${styles.span2}`}>
                                    <div className={styles.infoBox}>
                                        Unit: <strong>{selectedProduct.unit ?? 'PCS'}</strong> &nbsp;|&nbsp;
                                        Available Stock: <strong>{selectedProduct.current_stock ?? 0}</strong>
                                    </div>
                                </div>
                            )}

                            <div className={styles.field}>
                                <label>Qty to Transfer <span className={styles.req}>*</span></label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    required
                                    placeholder="0"
                                    value={form.qty}
                                    onChange={e => set('qty', e.target.value)}
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
                        {loading ? 'Saving...' : 'Create Transfer'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
