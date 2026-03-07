'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMaterialIssue } from '@/app/actions/production'
import type { MaterialIssueFormData } from '@/types/production'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { routeCards: any[]; products: any[]; warehouses: any[]; currentUser: any }

export default function MaterialIssueForm({ routeCards, products, warehouses, currentUser }: Props) {
  const router = useRouter()

  const [form, setForm] = useState<MaterialIssueFormData>({
    issue_no:      '',
    route_card_id: 0,
    product_id:    0,
    warehouse_id:  null,
    qty_requested: 0,
    qty_issued:    0,
    issue_date:    new Date().toISOString().split('T')[0],
    issued_by:     currentUser?.id ?? null,
    remarks:       '',
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof MaterialIssueFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Selected product stock info
  const selectedProduct = products.find(p => p.id === form.product_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.issue_no)        { setError('Enter issue number'); return }
    if (form.route_card_id === 0) { setError('Select a route card'); return }
    if (form.product_id === 0) { setError('Select a product'); return }
    if (form.qty_requested <= 0) { setError('Quantity must be greater than 0'); return }
    setLoading(true)
    setError(null)
    const result = await createMaterialIssue(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/production/material-issue')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>New Material Issue</h1>
          <p className={styles.subtitle}>Issue raw material to production floor</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="Issue Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Issue No <span className={styles.req}>*</span></label>
                <input required placeholder="e.g. MI-2024-001" value={form.issue_no}
                  onChange={e => setField('issue_no', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Issue Date</label>
                <input type="date" value={form.issue_date}
                  onChange={e => setField('issue_date', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Route Card <span className={styles.req}>*</span></label>
                <select required value={form.route_card_id}
                  onChange={e => setField('route_card_id', Number(e.target.value))}>
                  <option value={0}>Select route card</option>
                  {routeCards.map(rc => (
                    <option key={rc.id} value={rc.id}>
                      {rc.route_card_no} — {(rc.product as any)?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Material / Product <span className={styles.req}>*</span></label>
                <select required value={form.product_id}
                  onChange={e => setField('product_id', Number(e.target.value))}>
                  <option value={0}>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Warehouse</label>
                <select value={form.warehouse_id ?? ''}
                  onChange={e => setField('warehouse_id', e.target.value ? Number(e.target.value) : null)}>
                  <option value="">Select warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Qty Requested <span className={styles.req}>*</span></label>
                <input type="number" min={1} required value={form.qty_requested}
                  onChange={e => setField('qty_requested', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Qty Issued</label>
                <input type="number" min={0} value={form.qty_issued}
                  onChange={e => setField('qty_issued', Number(e.target.value))} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea rows={2} value={form.remarks}
                  onChange={e => setField('remarks', e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Stock Info Panel */}
          {selectedProduct && (
            <Card title="Stock Info">
              <div className={styles.stockInfoGrid}>
                <div className={styles.stockInfoItem}>
                  <span>Product</span>
                  <strong>{selectedProduct.name}</strong>
                </div>
                <div className={styles.stockInfoItem}>
                  <span>Current Stock</span>
                  <strong style={{
                    color: selectedProduct.current_stock >= form.qty_requested
                      ? 'var(--green)' : 'var(--red)'
                  }}>
                    {selectedProduct.current_stock} {selectedProduct.unit}
                  </strong>
                </div>
                <div className={styles.stockInfoItem}>
                  <span>Min Stock Level</span>
                  <strong>{selectedProduct.min_stock_level} {selectedProduct.unit}</strong>
                </div>
                <div className={styles.stockInfoItem}>
                  <span>Requested Qty</span>
                  <strong>{form.qty_requested} {selectedProduct.unit}</strong>
                </div>
                <div className={styles.stockInfoItem}>
                  <span>After Issue</span>
                  <strong style={{
                    color: (selectedProduct.current_stock - form.qty_requested) >= 0
                      ? 'var(--green)' : 'var(--red)'
                  }}>
                    {selectedProduct.current_stock - form.qty_requested} {selectedProduct.unit}
                  </strong>
                </div>
                {selectedProduct.current_stock < form.qty_requested && (
                  <div className={`${styles.field} ${styles.span2}`}>
                    <div className={styles.stockWarning}>
                      ⚠ Insufficient stock — requested exceeds available
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Issue Material'}
          </Button>
        </div>
      </form>
    </div>
  )
}