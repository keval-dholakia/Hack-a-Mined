'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createReceiptVoucher } from '@/app/actions/receiptVouchers'
import type { ReceiptVoucherFormData } from '@/types/receiptVoucher'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import styles from './Sales.module.scss'

type Props = {
  voucher?:   any
  customers:  any[]
  invoices:   any[]
}

const EMPTY: ReceiptVoucherFormData = {
  receipt_no:   '',
  invoice_id:   null,
  customer_id:  0,
  receipt_date: new Date().toISOString().split('T')[0],
  amount:       0,
  mode:         'NEFT',
  ref_no:       '',
  remarks:      '',
}

export default function ReceiptVoucherForm({ voucher, customers, invoices }: Props) {
  const router  = useRouter()
  const isEdit  = !!voucher
  const isView  = isEdit // receipts are view-only after creation

  const [form, setForm] = useState<ReceiptVoucherFormData>(
    voucher ? {
      receipt_no:   voucher.receipt_no,
      invoice_id:   voucher.invoice_id,
      customer_id:  voucher.customer_id,
      receipt_date: voucher.receipt_date,
      amount:       voucher.amount,
      mode:         voucher.mode,
      ref_no:       voucher.ref_no   ?? '',
      remarks:      voucher.remarks  ?? '',
    } : { ...EMPTY }
  )

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function setField(key: keyof ReceiptVoucherFormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Auto-fill customer and amount when invoice selected
  function handleInvoiceChange(invoiceId: number | null) {
    if (!invoiceId) {
      setForm(prev => ({ ...prev, invoice_id: null }))
      return
    }

    const invoice = invoices.find(i => i.id === invoiceId)
    setForm(prev => ({
      ...prev,
      invoice_id:  invoiceId,
      customer_id: invoice?.customer_id ?? prev.customer_id,
      amount:      invoice?.grand_total  ?? prev.amount,
    }))
  }

  // Selected invoice details for display
  const selectedInvoice = invoices.find(i => i.id === form.invoice_id)

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.customer_id === 0) { setError('Select a customer'); return }
    if (form.amount <= 0)       { setError('Amount must be greater than 0'); return }

    setLoading(true)
    setError(null)

    const result = await createReceiptVoucher(form)

    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard/sales/collections')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {isView ? 'Receipt Voucher' : 'New Receipt'}
          </h1>
          <p className={styles.subtitle}>
            {isView ? `Receipt No: ${voucher.receipt_no}` : 'Record a payment received from customer'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>

          {/* Receipt Details */}
          <Card title="Receipt Details">
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Receipt No <span className={styles.req}>*</span></label>
                <input
                  required
                  disabled={isView}
                  placeholder="e.g. REC-2024-001"
                  value={form.receipt_no}
                  onChange={e => setField('receipt_no', e.target.value)}
                  className={isView ? styles.readOnly : ''}
                />
              </div>
              <div className={styles.field}>
                <label>Receipt Date <span className={styles.req}>*</span></label>
                <input
                  type="date"
                  required
                  disabled={isView}
                  value={form.receipt_date}
                  onChange={e => setField('receipt_date', e.target.value)}
                  className={isView ? styles.readOnly : ''}
                />
              </div>

              {/* Invoice Selector */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Invoice Reference</label>
                <select
                  disabled={isView}
                  value={form.invoice_id ?? ''}
                  onChange={e => handleInvoiceChange(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select invoice (optional)</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_no} — {(inv.customer as any)?.name} — {fmt(inv.grand_total)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer */}
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Customer <span className={styles.req}>*</span></label>
                <select
                  required
                  disabled={isView}
                  value={form.customer_id}
                  onChange={e => setField('customer_id', Number(e.target.value))}
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
                <label>Amount (₹) <span className={styles.req}>*</span></label>
                <input
                  type="number"
                  required
                  disabled={isView}
                  min={0.01}
                  step={0.01}
                  value={form.amount}
                  onChange={e => setField('amount', Number(e.target.value))}
                  className={isView ? styles.readOnly : ''}
                />
              </div>

              <div className={styles.field}>
                <label>Payment Mode <span className={styles.req}>*</span></label>
                <select
                  required
                  disabled={isView}
                  value={form.mode}
                  onChange={e => setField('mode', e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="NEFT">NEFT</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div className={`${styles.field} ${styles.span2}`}>
                <label>Reference No</label>
                <input
                  disabled={isView}
                  placeholder="Cheque no / UTR no / UPI ref"
                  value={form.ref_no}
                  onChange={e => setField('ref_no', e.target.value)}
                  className={isView ? styles.readOnly : ''}
                />
              </div>

              <div className={`${styles.field} ${styles.span2}`}>
                <label>Remarks</label>
                <textarea
                  rows={2}
                  disabled={isView}
                  placeholder="Any notes..."
                  value={form.remarks}
                  onChange={e => setField('remarks', e.target.value)}
                  className={isView ? styles.readOnly : ''}
                />
              </div>
            </div>
          </Card>

          {/* Invoice Summary (if linked) */}
          {selectedInvoice && (
            <Card title="Invoice Summary">
              <div className={styles.invoiceSummary}>
                <div className={styles.summaryLine}>
                  <span>Invoice No</span>
                  <strong>{selectedInvoice.invoice_no}</strong>
                </div>
                <div className={styles.summaryLine}>
                  <span>Invoice Amount</span>
                  <strong>{fmt(selectedInvoice.grand_total)}</strong>
                </div>
                <div className={styles.summaryLine}>
                  <span>Current Status</span>
                  <strong style={{
                    color: selectedInvoice.payment_status === 'Paid'    ? 'var(--green)'
                         : selectedInvoice.payment_status === 'Partial' ? 'var(--amber)'
                         : 'var(--red)'
                  }}>
                    {selectedInvoice.payment_status}
                  </strong>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryLine}>
                  <span>Receiving Now</span>
                  <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>
                    {fmt(form.amount)}
                  </strong>
                </div>
                {form.amount >= selectedInvoice.grand_total && (
                  <div className={styles.fullPaymentBadge}>
                    ✓ Full payment — invoice will be marked Paid
                  </div>
                )}
                {form.amount > 0 && form.amount < selectedInvoice.grand_total && (
                  <div className={styles.partialPaymentBadge}>
                    Partial payment — invoice will be marked Partial
                  </div>
                )}
              </div>
            </Card>
          )}

        </div>

        {error && <p className={styles.error}>{error}</p>}

        {!isView && (
          <div className={styles.footer}>
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Create Receipt'}
            </Button>
          </div>
        )}

        {isView && (
          <div className={styles.footer}>
            <Button variant="ghost" onClick={() => router.back()}>← Back to Collections</Button>
          </div>
        )}
      </form>
    </div>
  )
}