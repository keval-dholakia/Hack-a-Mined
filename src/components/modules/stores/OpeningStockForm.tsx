'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOpeningStock } from '@/app/actions/stores'
import type { WarehouseOpeningFormData } from '@/types/stores'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'

type SelectItem = { id: number; name: string; code?: string | null; unit?: string | null; current_stock?: number }
type Warehouse = { id: number; name: string; code?: string | null }

type Props = {
    warehouses: Warehouse[]
    products: SelectItem[]
}

const EMPTY: WarehouseOpeningFormData = {
    warehouse_id: '',
    product_id: '',
    opening_qty: '',
    opening_value: '',
    opening_date: new Date().toISOString().slice(0, 10),
    remarks: '',
}

export default function OpeningStockForm({ warehouses, products }: Props) {
    const router = useRouter()
    const [form, setForm] = useState<WarehouseOpeningFormData>(EMPTY)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const selectedProduct = products.find(p => p.id === parseInt(form.product_id))

    function set(key: keyof WarehouseOpeningFormData, value: string) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.warehouse_id) { setError('Please select a warehouse'); return }
        if (!form.product_id) { setError('Please select a product'); return }

        setLoading(true)
        setError(null)

        const result = await createOpeningStock(form)
        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }
        router.push('/dashboard/stores/opening-stock')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Add Opening Stock</h1>
                    <p className={styles.subtitle}>Initial stock setup for a warehouse item</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>

                    <Card title="Warehouse & Item">
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>Warehouse <span className={styles.req}>*</span></label>
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

                            <div className={styles.field}>
                                <label>Opening Date <span className={styles.req}>*</span></label>
                                <input
                                    type="date"
                                    required
                                    value={form.opening_date}
                                    onChange={e => set('opening_date', e.target.value)}
                                />
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

                            {selectedProduct && (
                                <div className={`${styles.field} ${styles.span2}`}>
                                    <div className={styles.infoBox}>
                                        Unit: <strong>{selectedProduct.unit ?? 'PCS'}</strong> &nbsp;|&nbsp;
                                        Current Stock: <strong>{selectedProduct.current_stock ?? 0}</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="Stock Details">
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>Opening Qty <span className={styles.req}>*</span></label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    required
                                    placeholder="e.g. 100"
                                    value={form.opening_qty}
                                    onChange={e => set('opening_qty', e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Opening Value (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="e.g. 50000"
                                    value={form.opening_value}
                                    onChange={e => set('opening_value', e.target.value)}
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
                        {loading ? 'Saving...' : 'Save Opening Entry'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
