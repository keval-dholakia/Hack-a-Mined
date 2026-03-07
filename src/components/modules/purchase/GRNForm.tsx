'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGRN, updateGRN } from '@/app/actions/purchase'
import type { GRNFormData, GRNItemFormData } from '@/types/purchase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { grn?: any; pos: any[]; vendors: any[]; products: any[]; warehouses: any[] }

const EMPTY_ITEM: GRNItemFormData = {
  product_id: 0, ordered_qty: 0, received_qty: 0,
  accepted_qty: 0, rejected_qty: 0, sample_size: 0,
  rack_bin: '', batch_no: '',
}

export default function GRNForm({ grn, pos, vendors, products, warehouses }: Props) {
  const router = useRouter()
  const isEdit = !!grn

  const [form, setForm] = useState<GRNFormData>({
    grn_no:            grn?.grn_no            ?? '',
    po_id:             grn?.po_id             ?? 0,
    vendor_id:         grn?.vendor_id         ?? 0,
    vendor_challan_no: grn?.vendor_challan_no ?? '',
    gate_entry_date:   grn?.gate_entry_date   ?? new Date().toISOString().split('T')[0],
    vehicle_no:        grn?.vehicle_no        ?? '',
    warehouse_id:      grn?.warehouse_id      ?? null,
    status:            grn?.status            ?? 'Pending',
    remarks:           grn?.remarks           ?? '',
    items: grn?.items?.map((i: any) => ({
      product_id:   i.product_id,
      ordered_qty:  i.ordered_qty,
      received_qty: i.received_qty,
      accepted_qty: i.accepted_qty,
      rejected_qty: i.rejected_qty,
      sample_size:  i.sample_size,
      rack_bin:     i.rack_bin  ?? '',
      batch_no:     i.batch_no  ?? '',
    })) ?? [{ ...EMPTY_ITEM }],
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof GRNFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Auto-fill vendor when PO selected
  function handlePOChange(poId: number) {
    const po = pos.find(p => p.id === poId)
    setForm(prev => ({
      ...prev,
      po_id:     poId,
      vendor_id: po?.vendor_id ?? prev.vendor_id,
    }))
  }

  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(idx: number) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  function updateItem(idx: number, key: keyof GRNItemFormData, value: any) {
    setForm(prev => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [key]: value }
      // Auto-calc rejected = received - accepted
      if (key === 'received_qty' || key === 'accepted_qty') {
        items[idx].rejected_qty = Math.max(
          0, items[idx].received_qty - items[idx].accepted_qty
        )
      }
      return { ...prev, items }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.po_id === 0)                        { setError('Select a PO'); return }
    if (form.vendor_id === 0)                    { setError('Select a vendor'); return }
    if (form.items.some(i => i.product_id === 0)) { setError('Select product for all items'); return }
    setLoading(true)
    setError(null)
    const result = isEdit
      ? await updateGRN(grn.id, form)
      : await createGRN(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/purchase/grn')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit GRN' : 'New GRN'}</h1>
          <p className={styles.subtitle}>{isEdit ? `Editing ${grn.grn_no}` : 'Record goods received'}</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="GRN Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>GRN No <span className={styles.req}>*</span></label>
                <input required placeholder="e.g. GRN-2024-001" value={form.grn_no}
                  onChange={e => setField('grn_no', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Gate Entry Date <span className={styles.req}>*</span></label>
                <input type="date" required value={form.gate_entry_date}
                  onChange={e => setField('gate_entry_date', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>PO Reference <span className={styles.req}>*</span></label>
                <select required value={form.po_id}
                  onChange={e => handlePOChange(Number(e.target.value))}>
                  <option value={0}>Select PO</option>
                  {pos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.po_no} — {(p.vendor as any)?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Vendor <span className={styles.req}>*</span></label>
                <select required value={form.vendor_id}
                  onChange={e => setField('vendor_id', Number(e.target.value))}>
                  <option value={0}>Select vendor</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Vendor Challan No</label>
                <input placeholder="Vendor's challan number" value={form.vendor_challan_no}
                  onChange={e => setField('vendor_challan_no', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Vehicle No</label>
                <input placeholder="e.g. GJ01AB1234" value={form.vehicle_no}
                  onChange={e => setField('vehicle_no', e.target.value.toUpperCase())} />
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
                <label>Status</label>
                <select value={form.status} onChange={e => setField('status', e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="IQC Done">IQC Done</option>
                  <option value="Received">Received</option>
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

        <Card title="Items Received">
          <div className={styles.itemsTable}>
            <div className={styles.itemsHeader}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 40px' }}>
              <span>Product</span><span>Ordered</span><span>Received</span>
              <span>Accepted</span><span>Rejected</span><span>Batch No</span>
              <span>Rack/Bin</span><span></span>
            </div>
            {form.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 40px' }}>
                <select value={item.product_id}
                  onChange={e => updateItem(idx, 'product_id', Number(e.target.value))}>
                  <option value={0}>Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min={0} value={item.ordered_qty}
                  onChange={e => updateItem(idx, 'ordered_qty', Number(e.target.value))} />
                <input type="number" min={0} value={item.received_qty}
                  onChange={e => updateItem(idx, 'received_qty', Number(e.target.value))} />
                <input type="number" min={0} value={item.accepted_qty}
                  onChange={e => updateItem(idx, 'accepted_qty', Number(e.target.value))} />
                <input readOnly value={item.rejected_qty} className={styles.readOnly} />
                <input placeholder="Batch no" value={item.batch_no}
                  onChange={e => updateItem(idx, 'batch_no', e.target.value)} />
                <input placeholder="Rack/Bin" value={item.rack_bin}
                  onChange={e => updateItem(idx, 'rack_bin', e.target.value)} />
                <button type="button" className={styles.removeBtn}
                  onClick={() => removeItem(idx)}>✕</button>
              </div>
            ))}
            <button type="button" className={styles.addRowBtn} onClick={addItem}>
              + Add Item
            </button>
          </div>
        </Card>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update GRN' : 'Create GRN'}
          </Button>
        </div>
      </form>
    </div>
  )
}