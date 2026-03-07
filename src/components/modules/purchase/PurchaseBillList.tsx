'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Purchase.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { downloadTransactionHtmlPdf } from '@/lib/pdf/downloadTransactionHtmlPdf'
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { bills: any[] }

const PAYMENT_VARIANT: Record<string, any> = {
  Unpaid: 'danger',
  Partial: 'warning',
  Paid: 'success',
}

export default function PurchaseBillList({ bills }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = bills.filter(b => {
    const matchSearch =
      b.bill_no.toLowerCase().includes(search.toLowerCase()) ||
      b.vendor?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.vendor_invoice_no?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? b.payment_status === status : true
    return matchSearch && matchStatus
  })

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  const totalPayable = bills
    .filter(b => b.payment_status !== 'Paid')
    .reduce((s, b) => s + Number(b.total), 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Purchase Billbook</h1>
          <p className={styles.subtitle}>
            {bills.length} bills • Payable: {fmt(totalPayable)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Purchase Billbook Registry',
            subtitle: `${filtered.length} bills · Total Payable: ${fmt(totalPayable)}`,
            columns: [
              { header: 'Bill No', dataKey: 'bill_no' },
              { header: 'Vendor', dataKey: 'vendor_name' },
              { header: 'GRN Ref', dataKey: 'grn_no' },
              { header: 'Vendor Inv', dataKey: 'vendor_invoice_no' },
              { header: 'Date', dataKey: 'invoice_date' },
              { header: 'Taxable', dataKey: 'taxable_value', format: 'currency', align: 'right' },
              { header: 'GST', dataKey: 'gst_amount', format: 'currency', align: 'right' },
              { header: 'Total', dataKey: 'total', format: 'currency', align: 'right' },
              { header: 'Status', dataKey: 'payment_status' },
            ],
            rows: filtered.map(b => ({
              ...b,
              vendor_name: b.vendor?.name || '—',
              grn_no: b.grn?.grn_no || '—',
              vendor_invoice_no: b.vendor_invoice_no || '—',
              invoice_date: b.invoice_date ? fmtDate(b.invoice_date) : '—',
              taxable_value: Number(b.taxable_value) || 0,
              gst_amount: Number(b.gst_amount) || 0,
              total: Number(b.total) || 0,
              payment_status: b.payment_status || '—'
            })),
            fileName: 'Purchase_Billbook'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/billbook/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/purchase/billbook/new')}>
            + New Bill
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by bill no, vendor or invoice no..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect}
          value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'bill_no', label: 'Bill No' },
            { key: 'vendor', label: 'Vendor', render: v => (v as any)?.name ?? '—' },
            { key: 'grn', label: 'GRN Ref', render: v => (v as any)?.grn_no ?? '—' },
            { key: 'vendor_invoice_no', label: 'Vendor Inv', render: v => v as string || '—' },
            { key: 'invoice_date', label: 'Date' },
            {
              key: 'taxable_value', label: 'Taxable', align: 'r',
              render: v => fmt(v as number)
            },
            {
              key: 'gst_amount', label: 'GST', align: 'r',
              render: v => fmt(v as number)
            },
            {
              key: 'total', label: 'Total', align: 'r',
              render: v => fmt(v as number)
            },
            {
              key: 'payment_status', label: 'Status', align: 'c',
              render: v => <Badge label={v as string} variant={PAYMENT_VARIANT[v as string]} />
            },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: (v, r: any) => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/purchase/billbook/${v}`)}>Edit</button>
                  <button className={styles.editBtn}
                    onClick={() => downloadTransactionHtmlPdf({
                      type: 'Purchase Bill',
                      voucherNo: r.bill_no || `BILL-${v}`,
                      date: r.invoice_date || 'N/A',
                      partyName: r.vendor?.name || 'Unknown Vendor',
                      amount: Number(r.total) || 0,
                      narration: `Purchase Bill for Vendor Inv: ${r.vendor_invoice_no || 'N/A'}`,
                      entries: [
                        { label: 'Taxable Amount', debit: Number(r.taxable_value) || 0, credit: 0 },
                        { label: 'GST Amount', debit: Number(r.gst_amount) || 0, credit: 0 }
                      ],
                      extras: {
                        'GRN Ref': r.grn?.grn_no || 'N/A',
                        'Payment Status': r.payment_status || 'N/A'
                      }
                    })}>PDF</button>
                </div>
              )
            },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}