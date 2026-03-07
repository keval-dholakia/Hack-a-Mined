'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createInvoice, updateInvoice } from '@/app/actions/invoices'
import type { InvoiceFormData, InvoiceItemFormData } from '@/types/invoice'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Sales.module.scss'

type Props = {
  invoice?:   any
  customers:  any[]
  products:   any[]
  saleOrders: any[]
}

const EMPTY_ITEM: InvoiceItemFormData = {
  product_id: 0, quantity: 1, rate: 0,
  gst_percent: 18, taxable_value: 0, gst_amount: 0, total: 0,
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
]

function calcItem(item: InvoiceItemFormData): InvoiceItemFormData {
  const taxable_value = item.quantity * item.rate
  const gst_amount    = +(taxable_value * item.gst_percent / 100).toFixed(2)
  const total         = +(taxable_value + gst_amount).toFixed(2)
  return { ...item, taxable_value: +taxable_value.toFixed(2), gst_amount, total }
}

function calcDueDate(invoiceDate: string, creditPeriod: number): string {
  const date = new Date(invoiceDate)
  date.setDate(date.getDate() + creditPeriod)
  return date.toISOString().split('T')[0]
}

export default function InvoiceForm({ invoice, customers, products, saleOrders }: Props) {
  const router = useRouter()
  const isEdit = !!invoice

  const [form, setForm] = useState<InvoiceFormData>({
    invoice_no:       invoice?.invoice_no       ?? '',
    so_id:            invoice?.so_id            ?? null,
    customer_id:      invoice?.customer_id      ?? 0,
    invoice_date:     invoice?.invoice_date     ?? new Date().toISOString().split('T')[0],
    due_date:         invoice?.due_date         ?? '',
    place_of_supply:  invoice?.place_of_supply  ?? '',
    eway_bill_no:     invoice?.eway_bill_no     ?? '',
    taxable_value:    invoice?.taxable_value    ?? 0,
    gst_amount:       invoice?.gst_amount       ?? 0,
    round_off:        invoice?.round_off        ?? 0,
    grand_total:      invoice?.grand_total      ?? 0,
    payment_status:   invoice?.payment_status   ?? 'Unpaid',
    reminder_setting: invoice?.reminder_setting ?? 'Moderate',
    items: invoice?.items?.map((i: any) => ({
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

  function setField(key: keyof InvoiceFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Auto-fill when customer selected
  function handleCustomerChange(customerId: number) {
    const customer = customers.find(c => c.id === customerId)
    const due_date = customer?.credit_period
      ? calcDueDate(form.invoice_date, customer.credit_period)
      : form.due_date

    setForm(prev => ({
      ...prev,
      customer_id:     customerId,
      place_of_supply: customer?.place_of_supply ?? prev.place_of_supply,
      due_date,
    }))
  }

  // Auto-fill when invoice date changes
  function handleDateChange(date: string) {
    const customer   = customers.find(c => c.id === form.customer_id)
    const due_date   = customer?.credit_period
      ? calcDueDate(date, customer.credit_period)
      : form.due_date

    setForm(prev => ({ ...prev, invoice_date: date, due_date }))
  }

  // ── Item helpers ──────────────────────────
  function addItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(index: number) {
    setForm(prev => {
      const items = prev.items.filter((_, i) => i !== index)
      return { ...prev, items, ...recalcTotals(items, prev.round_off) }
    })
  }

  function updateItem(index: number, key: keyof InvoiceItemFormData, value: any) {
    setForm(prev => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: value }

      if (key === 'product_id') {
        const product = products.find(p => p.id === Number(value))
        if (product) {
          items[index].rate        = product.sale_price   ?? 0
          items[index].gst_percent = product.gst_percent  ?? 18
        }
      }

      items[index] = calcItem(items[index])
      return { ...prev, items, ...recalcTotals(items, prev.round_off) }
    })
  }

  function recalcTotals(items: InvoiceItemFormData[], roundOff: number) {
    const taxable_value = +items.reduce((s, i) => s + i.taxable_value, 0).toFixed(2)
    const gst_amount    = +items.reduce((s, i) => s + i.gst_amount,    0).toFixed(2)
    const grand_total   = +(taxable_value + gst_amount + roundOff).toFixed(2)
    return { taxable_value, gst_amount, grand_total }
  }

  function handleRoundOff(val: number) {
    const taxable_value = form.taxable_value
    const gst_amount    = form.gst_amount
    const grand_total   = +(taxable_value + gst_amount + val).toFixed(2)
    setForm(prev => ({ ...prev, round_off: val, grand_total }))
  }

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.customer_id === 0)              { setError('Select a customer'); return }
    if (form.items.length === 0)             { setError('Add at least one item'); return }
    if (form.items.some(i => i.product_id === 0)) { setError('Select product for all items'); return }

    setLoading(true)
    setError(null)

    const result = isEdit
      ? await updateInvoice(invoice.id, form)
      : await createInvoice(form)

    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/sales/invoice')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className={styles.subtitle}>
            {isEdit ? `Editing ${invoice.invoice_no}` : 'Create a new invoice'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          {/* Invoice Details */}
          <Card title="Invoice Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Invoice No <span className={styles.req}>*</span></label>
                <input
                  required
                  placeholder="e.g. INV-2024-001"
                  value={form.invoice_no}
                  onChange={e => setField('invoice_no', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Invoice Date <span className={styles.req}>*</span></label>
                <input
                  type="date"
                  required
                  value={form.invoice_date}
                  onChange={e => handleDateChange(e.target.value)}
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
                <label>Sale Order Ref</label>
                <select
                  value={form.so_id ?? ''}
                  onChange={e => setField('so_id', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">None</option>
                  {saleOrders.map(so => (
                    <option key={so.id} value={so.id}>
                      {so.so_no} — {(so.customer as any)?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setField('due_date', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Place of Supply</label>
                <select
                  value={form.place_of_supply}
                  onChange={e => setField('place_of_supply', e.target.value)}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>E-Way Bill No</label>
                <input
                  placeholder="E-Way Bill number"
                  value={form.eway_bill_no}
                  onChange={e => setField('eway_bill_no', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Payment Settings */}
          <Card title="Payment Settings">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Payment Status</label>
                <select
                  value={form.payment_status}
                  onChange={e => setField('payment_status', e.target.value)}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Reminder Setting</label>
                <select
                  value={form.reminder_setting}
                  onChange={e => setField('reminder_setting', e.target.value)}
                >
                  <option value="Strict">Strict</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Lenient">Lenient</option>
                </select>
              </div>

              {/* GST Breakup */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label>GST Breakup</label>
                <div className={styles.gstBreakup}>
                  <div className={styles.gstRow}>
                    <span>CGST (9%)</span>
                    <strong>{fmt(form.gst_amount / 2)}</strong>
                  </div>
                  <div className={styles.gstRow}>
                    <span>SGST (9%)</span>
                    <strong>{fmt(form.gst_amount / 2)}</strong>
                  </div>
                  <div className={`${styles.gstRow} ${styles.gstTotal}`}>
                    <span>Total GST</span>
                    <strong>{fmt(form.gst_amount)}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Round Off</label>
                <input
                  type="number"
                  step={0.01}
                  value={form.round_off}
                  onChange={e => handleRoundOff(Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

        </div>

        {/* Items */}
        <Card title="Items">
          <div className={styles.itemsTable}>
            <div
              className={styles.itemsHeader}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 40px' }}
            >
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
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeItem(idx)}
                >✕</button>
              </div>
            ))}

            <button type="button" className={styles.addRowBtn} onClick={addItem}>
              + Add Item
            </button>

            {/* Totals */}
            <div className={styles.totalsBox}>
              <div className={styles.totalRow}>
                <span>Taxable Amount</span>
                <strong>{fmt(form.taxable_value)}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>GST Amount</span>
                <strong>{fmt(form.gst_amount)}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>Round Off</span>
                <strong>{fmt(form.round_off)}</strong>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Grand Total</span>
                <strong>{fmt(form.grand_total)}</strong>
              </div>
            </div>
          </div>
        </Card>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  )
}