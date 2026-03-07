'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPurchaseBill, updatePurchaseBill } from '@/app/actions/purchase'
import type { PurchaseBillFormData } from '@/types/purchase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'

type Props = { bill?: any; vendors: any[]; grns: any[] }

export default function PurchaseBillForm({ bill, vendors, grns }: Props) {
  const router = useRouter()
  const isEdit = !!bill

  const [form, setForm] = useState<PurchaseBillFormData>({
    bill_no:           bill?.bill_no           ?? '',
    vendor_id:         bill?.vendor_id         ?? 0,
    grn_id:            bill?.grn_id            ?? null,
    vendor_invoice_no: bill?.vendor_invoice_no ?? '',
    invoice_date:      bill?.invoice_date      ?? new Date().toISOString().split('T')[0],
    taxable_value:     bill?.taxable_value     ?? 0,
    gst_amount:        bill?.gst_amount        ?? 0,
    total:             bill?.total             ?? 0,
    payment_status:    bill?.payment_status    ?? 'Unpaid',
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof PurchaseBillFormData, value: any) {
    setForm(prev => {
      const updated = { ...prev, [key]: value }
      // Auto-calc total
      if (key === 'taxable_value' || key === 'gst_amount') {
        updated.total = +(updated.taxable_value + updated.gst_amount).toFixed(2)
      }
      return updated
    })
  }

  // Auto-fill vendor when GRN selected
  function handleGRNChange(grnId: number | null) {
    if (!grnId) { setForm(prev => ({ ...prev, grn_id: null })); return }
    const grn = grns.find(g => g.id === grnId)
    setForm(prev => ({
      ...prev,
      grn_id:    grnId,
      vendor_id: grn?.vendor_id ?? prev.vendor_id,
    }))
  }

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.vendor_id === 0) { setError('Select a vendor'); return }
    setLoading(true)
    setError(null)
    const result = isEdit
      ? await updatePurchaseBill(bill.id, form)
      : await createPurchaseBill(form)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/purchase/billbook')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Purchase Bill' : 'New Purchase Bill'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${bill.bill_no}` : 'Record vendor invoice'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Card title="Bill Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Bill No <span className={styles.req}>*</span></label>
                <input required placeholder="e.g. BILL-2024-001" value={form.bill_no}
                  onChange={e => setField('bill_no', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Invoice Date <span className={styles.req}>*</span></label>
                <input type="date" required value={form.invoice_date}
                  onChange={e => setField('invoice_date', e.target.value)} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>GRN Reference</label>
                <select value={form.grn_id ?? ''}
                  onChange={e => handleGRNChange(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">Select GRN (optional)</option>
                  {grns.map(g => <option key={g.id} value={g.id}>{g.grn_no}</option>)}
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Vendor <span className={styles.req}>*</span></label>
                <select required value={form.vendor_id}
                  onChange={e => setField('vendor_id', Number(e.target.value))}>
                  <option value={0}>Select vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Vendor Invoice No</label>
                <input placeholder="Vendor's invoice number" value={form.vendor_invoice_no}
                  onChange={e => setField('vendor_invoice_no', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>Payment Status</label>
                <select value={form.payment_status}
                  onChange={e => setField('payment_status', e.target.value)}>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title="Amount Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Taxable Value (₹)</label>
                <input type="number" min={0} step={0.01} value={form.taxable_value}
                  onChange={e => setField('taxable_value', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>GST Amount (₹)</label>
                <input type="number" min={0} step={0.01} value={form.gst_amount}
                  onChange={e => setField('gst_amount', Number(e.target.value))} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Total (₹)</label>
                <input readOnly value={fmt(form.total)} className={styles.readOnly} />
              </div>
            </div>
          </Card>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Bill' : 'Create Bill'}
          </Button>
        </div>
      </form>
    </div>
  )
}