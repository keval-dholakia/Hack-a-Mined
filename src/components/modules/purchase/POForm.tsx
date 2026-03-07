'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPurchaseOrder, updatePurchaseOrder } from '@/app/actions/purchase'
import type { POFormData, POItemFormData } from '@/types/purchase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { po?: any; vendors: any[]; products: any[] }

const EMPTY_ITEM: POItemFormData = {
  product_id: 0, quantity: 1, rate: 0,
  gst_percent: 18, expected_date: '', received_qty: 0,
}

export default function POForm({ po, vendors, products }: Props) {
  const router = useRouter()
  const isEdit = !!po

  const [form, setForm] = useState<POFormData>({
    po_no:         po?.po_no         ?? '',
    vendor_id:     po?.vendor_id     ?? 0,
    po_date:       po?.po_date       ?? new Date().toISOString().split('T')[0],
    valid_until:   po?.valid_until   ?? '',
    delivery_date: po?.delivery_date ?? '',
    status:        po?.status        ?? 'Open',
    remarks:       po?.remarks       ?? '',
    items: po?.items?.map((i: any) => ({
      product_id:    i.product_id,
      quantity:      i.quantity,
      rate:          i.rate,
      gst_percent:   i.gst_percent,
      expected_date: i.expected_date ?? '',
      received_qty:  i.received_qty,
    })) ?? [{ ...EMPTY_ITEM }],
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof POFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(idx: number) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  function updateItem(idx: number, key: keyof POItemFormData, value: any) {
    setForm(prev => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [key]: value }
      if (key === 'product_id') {
        const p = products.find(p => p.id === Number(value))
        if (p) {
          items[idx].rate        = p.purchase_price ?? 0
          items[idx].gst_percent = p.gst_percent    ?? 18
        }
      }
      return { ...prev, items }
    })
  }

  const grandTotal = form.items.reduce((s, i) => {
    const taxable = i.quantity * i.rate
    return s + taxable + (taxable * i.gst_percent / 100)
  }, 0)

  function fmt(n: number) {
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.vendor_id === 0)                    { setError('Select a vendor'); return }
    if (form.items.some(i => i.product_id === 0)) { setError('Select product for all items'); return }
    setLoading(true)
    setError(null)
    const result = isEdit
      ? await updatePurchaseOrder(po.id, form)
      : await createPurchaseOrder(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/purchase/po')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}</h1>
          <p className={styles.subtitle}>{isEdit ? `Editing ${po.po_no}` : 'Create a new purchase order'}</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="Order Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>PO No <span className={styles.req}>*</span></label>
                <input required placeholder="e.g. PO-2024-001" value={form.po_no}
                  onChange={e => setField('po_no', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>PO Date <span className={styles.req}>*</span></label>
                <input type="date" required value={form.po_date}
                  onChange={e => setField('po_date', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Vendor <span className={styles.req}>*</span></label>
                <select required value={form.vendor_id}
                  onChange={e => setField('vendor_id', Number(e.target.value))}>
                  <option value={0}>Select vendor</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}{v.code ? ` (${v.code})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Valid Until</label>
                <input type="date" value={form.valid_until}
                  onChange={e => setField('valid_until', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Expected Delivery</label>
                <input type="date" value={form.delivery_date}
                  onChange={e => setField('delivery_date', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select value={form.status} onChange={e => setField('status', e.target.value)}>
                  <option value="Open">Open</option>
                  <option value="Partial">Partial</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea rows={2} value={form.remarks}
                  onChange={e => setField('remarks', e.target.value)} />
              </div>
            </div>
          </Card>
        </div>

        <Card title="Items">
          <div className={styles.itemsTable}>
            <div className={styles.itemsHeader}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px' }}>
              <span>Product</span><span>Qty</span>
              <span>Rate (₹)</span><span>GST %</span>
              <span>Expected Date</span><span></span>
            </div>
            {form.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px' }}>
                <select value={item.product_id}
                  onChange={e => updateItem(idx, 'product_id', Number(e.target.value))}>
                  <option value={0}>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input type="number" min={1} value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                <input type="number" min={0} step={0.01} value={item.rate}
                  onChange={e => updateItem(idx, 'rate', Number(e.target.value))} />
                <select value={item.gst_percent}
                  onChange={e => updateItem(idx, 'gst_percent', Number(e.target.value))}>
                  {[0,5,12,18,28].map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
                <input type="date" value={item.expected_date}
                  onChange={e => updateItem(idx, 'expected_date', e.target.value)} />
                <button type="button" className={styles.removeBtn}
                  onClick={() => removeItem(idx)}>✕</button>
              </div>
            ))}
            <button type="button" className={styles.addRowBtn} onClick={addItem}>
              + Add Item
            </button>
            <div className={styles.totalsBox}>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Grand Total</span>
                <strong>{fmt(grandTotal)}</strong>
              </div>
            </div>
          </div>
        </Card>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update PO' : 'Create PO'}
          </Button>
        </div>
      </form>
    </div>
  )
}