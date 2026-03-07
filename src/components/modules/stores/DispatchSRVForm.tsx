'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDispatchSRV, updateDispatchSRV } from '@/app/actions/stores'
import type { DispatchSRVFormData } from '@/types/stores'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Stores.module.scss'

type SelectItem = { id: number; name: string; code?: string | null; unit?: string | null }
type Props = {
    products: SelectItem[]
    srv?: { id: number } & DispatchSRVFormData
}

const EMPTY: DispatchSRVFormData = {
    srv_no: '',
    srv_date: new Date().toISOString().slice(0, 10),
    party_name: '',
    product_id: '',
    qty: '',
    returnable: '0',
    return_by_date: '',
    remarks: '',
}

export default function DispatchSRVForm({ products, srv }: Props) {
    const router = useRouter()
    const isEdit = !!srv

    const [form, setForm] = useState<DispatchSRVFormData>(
        srv ? {
            srv_no: srv.srv_no,
            srv_date: srv.srv_date,
            party_name: srv.party_name ?? '',
            product_id: srv.product_id ?? '',
            qty: srv.qty ?? '',
            returnable: srv.returnable ?? '0',
            return_by_date: srv.return_by_date ?? '',
            remarks: srv.remarks ?? '',
        } : EMPTY
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function set(key: keyof DispatchSRVFormData, value: string) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = isEdit
            ? await updateDispatchSRV(srv!.id, form)
            : await createDispatchSRV(form)

        if (result.error) {
            setError(result.error)
            setLoading(false)
            return
        }
        router.push('/dashboard/stores/dispatch-srv')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isEdit ? 'Edit Dispatch SRV' : 'New Dispatch SRV'}</h1>
                    <p className={styles.subtitle}>Non-sales dispatch / returnable gate pass</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>

                    <Card title="SRV Header">
                        <div className={styles.fields}>
                            <div className={styles.field}>
                                <label>SRV No <span className={styles.req}>*</span></label>
                                <input
                                    required
                                    placeholder="e.g. SRV-001"
                                    value={form.srv_no}
                                    onChange={e => set('srv_no', e.target.value)}
                                    readOnly={isEdit}
                                />
                            </div>

                            <div className={styles.field}>
                                <label>Date <span className={styles.req}>*</span></label>
                                <input
                                    type="date"
                                    required
                                    value={form.srv_date}
                                    onChange={e => set('srv_date', e.target.value)}
                                />
                            </div>

                            <div className={`${styles.field} ${styles.span2}`}>
                                <label>Party Name</label>
                                <input
                                    placeholder="Vendor / customer name"
                                    value={form.party_name}
                                    onChange={e => set('party_name', e.target.value)}
                                />
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

                            <div className={styles.field}>
                                <label>Qty <span className={styles.req}>*</span></label>
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

                            <div className={styles.field}>
                                <label>Returnable?</label>
                                <div className={styles.radioGroup}>
                                    <label>
                                        <input
                                            type="radio"
                                            value="1"
                                            checked={form.returnable === '1'}
                                            onChange={() => set('returnable', '1')}
                                        />
                                        Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="0"
                                            checked={form.returnable === '0'}
                                            onChange={() => set('returnable', '0')}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            {form.returnable === '1' && (
                                <div className={styles.field}>
                                    <label>Expected Return Date</label>
                                    <input
                                        type="date"
                                        value={form.return_by_date}
                                        onChange={e => set('return_by_date', e.target.value)}
                                    />
                                </div>
                            )}

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
                        {loading ? 'Saving...' : isEdit ? 'Update SRV' : 'Create SRV'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
