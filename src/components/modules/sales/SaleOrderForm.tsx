'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSaleOrder, updateSaleOrder } from '@/app/actions/saleOrders'
import type { SaleOrderFormData, SaleOrderItemFormData } from '@/types/saleOrder'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Sales.module.scss'

type Props = {
  saleOrder?:   any
  customers:    any[]
  products:     any[]
  inquiries:    any[]
  transporters: any[]
}

const EMPTY_ITEM: SaleOrderItemFormData = {
  product_id:    0,
  quantity:      1,
  rate:          0,
  gst_percent:   18,
  taxable_value: 0,
  gst_amount:    0,
  total:         0,
}

function calcItem(item: SaleOrderItemFormData): SaleOrderItemFormData {
  const taxable_value = item.quantity * item.rate
  const gst_amount    = taxable_value * item.gst_percent / 100
  const total         = taxable_value + gst_amount
  return { ...item, taxable_value, gst_amount, total }
}

export default function SaleOrderForm({
  saleOrder, customers, products, inquiries, transporters
}: Props) {
  const router = useRouter()
  const isEdit = !!saleOrder

  const [form, setForm] = useState<SaleOrderFormData>({
    so_no:            saleOrder?.so_no            ?? '',
    customer_id:      saleOrder?.customer_id      ?? 0,
    inquiry_id:       saleOrder?.inquiry_id       ?? null,
    customer_po_no:   saleOrder?.customer_po_no   ?? '',
    customer_po_date: saleOrder?.customer_po_date ?? '',
    so_date:          saleOrder?.so_date          ?? new Date().toISOString().split('T')[0],
    delivery_date:    saleOrder?.delivery_date    ?? '',
    billing_address:  saleOrder?.billing_address  ?? '',
    shipping_address: saleOrder?.shipping_address ?? '',
    transporter_id:   saleOrder?.transporter_id   ?? null,
    vehicle_no:       saleOrder?.vehicle_no       ?? '',
    driver_name:      saleOrder?.driver_name      ?? '',
    status:           saleOrder?.status           ?? 'Pending',
    remarks:          saleOrder?.remarks          ?? '',
    items:            saleOrder?.items?.map((i: any) => ({
      product_id:    i.product_id,
      quantity:      i.quantity,
      rate:          i.rate,
      gst_percent:   i.gst_percent,
      taxable_value: i.taxable_value,
      gst_amount:    i.gst_amount,
      total:         i.total,
    })) ?? [{ ...EMPTY_ITEM }],
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof SaleOrderFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Auto-fill addresses when customer selected
  function handleCustomerChange(customerId: number) {
    const customer = customers.find(c => c.id === customerId)
    setForm(prev => ({
      ...prev,
      customer_id:     customerId,
      billing_address:  customer?.billing_address  ?? prev.billing_address,
      shipping_address: customer?.shipping_address ?? prev.shipping_address,
    }))
  }

  // ── Item helpers ──────────────────────────
  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(index: number) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  function updateItem(index: number, key: keyof SaleOrderItemFormData, value: any) {
    setForm(prev => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: value }

      // Auto-fill rate and gst from product
      if (key === 'product_id') {
        const product = products.find(p => p.id === Number(value))
        if (product) {
          items[index].rate        = product.sale_price ?? 0
          items[index].gst_percent = product.gst_percent ?? 18
        }
      }

      items[index] = calcItem(items[index])
      return { ...prev, items }
    })
  }

  // ── Totals ────────────────────────────────
  const taxableTotal = form.items.reduce((s, i) => s + i.taxable_value, 0)
  const gstTotal     = form.items.reduce((s, i) => s + i.gst_amount,    0)
  const grandTotal   = taxableTotal + gstTotal

  function fmt(n: number) {
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.customer_id === 0) { setError('Select a customer'); return }
    if (form.items.length === 0) { setError('Add at least one item'); return }
    if (form.items.some(i => i.product_id === 0)) { setError('Select product for all items'); return }

    setLoading(true)
    setError(null)

    const result = isEdit
      ? await updateSaleOrder(saleOrder.id, form)
      : await createSaleOrder(form)

    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/sales/sale-order')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Sale Order' : 'New Sale Order'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${saleOrder.so_no}` : 'Create a new sale order'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          {/* Order Details */}
          <Card title="Order Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>SO No <span className={styles.req}>*</span></label>
                <input
                  required
                  placeholder="e.g. SO-2024-001"
                  value={form.so_no}
                  onChange={e => setField('so_no', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>SO Date <span className={styles.req}>*</span></label>
                <input
                  type="date"
                  required
                  value={form.so_date}
                  onChange={e => setField('so_date', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Customer <span className={styles.req}>*</span></label>
                <select
                  required
                  value={form.customer_id}
                  onChange={e => handleCustomerChange(Number(e.target.value))}
                >
                  <option value={0}>Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.code ? ` (${c.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Inquiry Ref</label>
                <select
                  value={form.inquiry_id ?? ''}
                  onChange={e => setField('inquiry_id', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">None</option>
                  {inquiries.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.inquiry_no} — {(i.customer as any)?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={e => setField('status', e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Delivery Date</label>
                <input
                  type="date"
                  value={form.delivery_date}
                  onChange={e => setField('delivery_date', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Customer PO */}
          <Card title="Customer PO Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Customer PO No</label>
                <input
                  placeholder="Customer's PO number"
                  value={form.customer_po_no}
                  onChange={e => setField('customer_po_no', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Customer PO Date</label>
                <input
                  type="date"
                  value={form.customer_po_date}
                  onChange={e => setField('customer_po_date', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Billing Address</label>
                <textarea
                  rows={2}
                  value={form.billing_address}
                  onChange={e => setField('billing_address', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Shipping Address</label>
                <textarea
                  rows={2}
                  value={form.shipping_address}
                  onChange={e => setField('shipping_address', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Dispatch Details */}
          <Card title="Dispatch Details">
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Transporter</label>
                <select
                  value={form.transporter_id ?? ''}
                  onChange={e => setField('transporter_id', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select transporter</option>
                  {transporters.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Vehicle No</label>
                <input
                  placeholder="e.g. GJ01AB1234"
                  value={form.vehicle_no}
                  onChange={e => setField('vehicle_no', e.target.value.toUpperCase())}
                />
              </div>
              <div className={styles.field}>
                <label>Driver Name</label>
                <input
                  placeholder="Driver name"
                  value={form.driver_name}
                  onChange={e => setField('driver_name', e.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea
                  rows={2}
                  value={form.remarks}
                  onChange={e => setField('remarks', e.target.value)}
                />
              </div>
            </div>
          </Card>

        </div>

        {/* Items */}
        <Card title="Items">
          <div className={styles.itemsTable}>
            <div className={styles.itemsHeader} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 40px' }}>
              <span>Product</span>
              <span>Qty</span>
              <span>Rate (₹)</span>
              <span>GST %</span>
              <span>Taxable</span>
              <span>GST Amt</span>
              <span>Total</span>
              <span></span>
            </div>

            {form.items.map((item, idx) => (
              <div
                key={idx}
                className={styles.itemRow}
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 40px' }}
              >
                <select
                  value={item.product_id}
                  onChange={e => updateItem(idx, 'product_id', Number(e.target.value))}
                >
                  <option value={0}>Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number" min={1}
                  value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                />
                <input
                  type="number" min={0} step={0.01}
                  value={item.rate}
                  onChange={e => updateItem(idx, 'rate', Number(e.target.value))}
                />
                <select
                  value={item.gst_percent}
                  onChange={e => updateItem(idx, 'gst_percent', Number(e.target.value))}
                >
                  {[0,5,12,18,28].map(r => (
                    <option key={r} value={r}>{r}%</option>
                  ))}
                </select>
                <input readOnly value={fmt(item.taxable_value)} className={styles.readOnly} />
                <input readOnly value={fmt(item.gst_amount)}    className={styles.readOnly} />
                <input readOnly value={fmt(item.total)}         className={styles.readOnly} />
                <button type="button" className={styles.removeBtn} onClick={() => removeItem(idx)}>✕</button>
              </div>
            ))}

            <button type="button" className={styles.addRowBtn} onClick={addItem}>
              + Add Item
            </button>

            {/* Totals */}
            <div className={styles.totalsBox}>
              <div className={styles.totalRow}>
                <span>Taxable Amount</span>
                <strong>{fmt(taxableTotal)}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>GST Amount</span>
                <strong>{fmt(gstTotal)}</strong>
              </div>
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
            {loading ? 'Saving...' : isEdit ? 'Update Sale Order' : 'Create Sale Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}