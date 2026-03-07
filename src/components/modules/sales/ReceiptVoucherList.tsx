'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Sales.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { downloadTransactionHtmlPdf } from '@/lib/pdf/downloadTransactionHtmlPdf'
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { vouchers: any[] }

const MODE_VARIANT: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  Cash: 'success',
  Cheque: 'warning',
  NEFT: 'info',
  UPI: 'default',
}

export default function ReceiptVoucherList({ vouchers }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('')

  const filtered = vouchers.filter(v => {
    const matchSearch =
      v.receipt_no.toLowerCase().includes(search.toLowerCase()) ||
      v.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      v.invoice?.invoice_no?.toLowerCase().includes(search.toLowerCase())
    const matchMode = mode ? v.mode === mode : true
    return matchSearch && matchMode
  })

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  // Summary stats
  const totalReceived = vouchers.reduce((s, v) => s + Number(v.amount), 0)
  const cashCount = vouchers.filter(v => v.mode === 'Cash').length
  const neftCount = vouchers.filter(v => v.mode === 'NEFT').length
  const upiCount = vouchers.filter(v => v.mode === 'UPI').length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Collections</h1>
          <p className={styles.subtitle}>{vouchers.length} receipts • Total {fmt(totalReceived)}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Collections Registry',
            subtitle: `${filtered.length} receipts · Total Collected: ${fmt(totalReceived)}`,
            columns: [
              { header: 'Receipt No', dataKey: 'receipt_no' },
              { header: 'Customer', dataKey: 'customer_name' },
              { header: 'Invoice Ref', dataKey: 'invoice_no' },
              { header: 'Date', dataKey: 'receipt_date' },
              { header: 'Amount', dataKey: 'amount', format: 'currency', align: 'right' },
              { header: 'Mode', dataKey: 'mode', align: 'center' },
              { header: 'Ref No', dataKey: 'ref_no' },
            ],
            rows: filtered.map(v => ({
              ...v,
              customer_name: v.customer?.name || '—',
              invoice_no: v.invoice?.invoice_no || '—',
              receipt_date: v.receipt_date ? fmtDate(v.receipt_date) : '—',
              amount: Number(v.amount) || 0,
              mode: v.mode || '—',
              ref_no: v.ref_no || '—'
            })),
            fileName: 'Collections_Registry'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/sales/collections/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/sales/collections/new')}>
            + New Receipt
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span>Total Collected</span>
          <strong>{fmt(totalReceived)}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>Cash Receipts</span>
          <strong>{cashCount}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>NEFT Receipts</span>
          <strong>{neftCount}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>UPI Receipts</span>
          <strong>{upiCount}</strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by receipt no, customer or invoice..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={mode}
          onChange={e => setMode(e.target.value)}
        >
          <option value="">All Modes</option>
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
          <option value="NEFT">NEFT</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'receipt_no', label: 'Receipt No' },
            {
              key: 'customer', label: 'Customer',
              render: v => (v as any)?.name ?? '—'
            },
            {
              key: 'invoice', label: 'Invoice Ref',
              render: v => (v as any)?.invoice_no ?? '—'
            },
            { key: 'receipt_date', label: 'Date' },
            {
              key: 'amount', label: 'Amount', align: 'r',
              render: v => fmt(v as number)
            },
            {
              key: 'mode', label: 'Mode', align: 'c',
              render: v => (
                <Badge
                  label={v as string}
                  variant={MODE_VARIANT[v as string]}
                />
              )
            },
            {
              key: 'ref_no', label: 'Ref No',
              render: v => v as string || '—'
            },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: (v, r: any) => (
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/sales/collections/${v}`)}
                  >
                    View
                  </button>
                  <button className={styles.editBtn}
                    onClick={() => downloadTransactionHtmlPdf({
                      type: 'Receipt Voucher',
                      voucherNo: r.receipt_no || `REC-${v}`,
                      date: r.receipt_date || 'N/A',
                      partyName: r.customer?.name || 'Unknown',
                      amount: Number(r.amount) || 0,
                      narration: `Payment received via ${r.mode || 'N/A'} for Invoice Ref: ${r.invoice?.invoice_no || 'N/A'}. Ref Mode No: ${r.ref_no || 'N/A'}. Remarks: ${r.remarks || 'None'}`,
                      entries: [
                        { label: `${r.mode || 'Cash/Bank'} A/c`, debit: Number(r.amount) || 0, credit: 0 },
                        { label: `${r.customer?.name || 'Customer'} A/c`, debit: 0, credit: Number(r.amount) || 0 }
                      ],
                      extras: {
                        'Mode': r.mode || 'N/A',
                        'Ref No': r.ref_no || 'N/A'
                      }
                    })}>
                    PDF
                  </button>
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