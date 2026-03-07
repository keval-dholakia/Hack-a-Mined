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
import { downloadVoucherPdf } from '@/lib/pdf/downloadVoucherPdf'
import { downloadInvoicePdf } from '@/lib/pdf/downloadInvoicePdf'
import downloadInvoiceHtmlPdf from '@/lib/pdf/downloadInvoiceHtmlPdf'
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { invoices: any[] }

const PAYMENT_VARIANT: Record<string, 'danger' | 'warning' | 'success'> = {
  Unpaid: 'danger',
  Partial: 'warning',
  Paid: 'success',
}

export default function InvoiceList({ invoices }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = invoices.filter(inv => {
    const matchSearch =
      inv.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? inv.payment_status === status : true
    return matchSearch && matchStatus
  })

  function fmt(n: number) {
    return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>{invoices.length} total invoices</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Sales Invoices Registry',
            subtitle: `${filtered.length} invoices`,
            columns: [
              { header: 'Invoice No', dataKey: 'invoice_no' },
              { header: 'Customer', dataKey: 'customer_name' },
              { header: 'SO Ref', dataKey: 'so_no' },
              { header: 'Date', dataKey: 'invoice_date' },
              { header: 'Due Date', dataKey: 'due_date' },
              { header: 'Amount', dataKey: 'grand_total', format: 'currency', align: 'right' },
              { header: 'Status', dataKey: 'payment_status' },
            ],
            rows: filtered.map(inv => ({
              ...inv,
              customer_name: inv.customer?.name || '—',
              so_no: inv.sale_order?.so_no || '—',
              invoice_date: inv.invoice_date ? fmtDate(inv.invoice_date) : '—',
              due_date: inv.due_date ? fmtDate(inv.due_date) : '—',
              grand_total: Number(inv.grand_total) || 0,
              payment_status: inv.payment_status || '—'
            })),
            fileName: 'Invoices_Registry'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/sales/invoice/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/sales/invoice/new')}>
            + New Invoice
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by invoice no or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'invoice_no', label: 'Invoice No' },
            {
              key: 'customer', label: 'Customer',
              render: v => (v as any)?.name ?? '—'
            },
            {
              key: 'sale_order', label: 'SO Ref',
              render: v => (v as any)?.so_no ?? '—'
            },
            { key: 'invoice_date', label: 'Date' },
            {
              key: 'due_date', label: 'Due Date',
              render: v => v as string || '—'
            },
            {
              key: 'grand_total', label: 'Amount', align: 'r',
              render: v => fmt(v as number)
            },
            {
              key: 'payment_status', label: 'Status', align: 'c',
              render: v => (
                <Badge
                  label={v as string}
                  variant={PAYMENT_VARIANT[v as string]}
                />
              )
            },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: (v, r: any) => (
                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/sales/invoice/${v}`)}
                  >
                    Edit
                  </button>
                  <button className={styles.editBtn} onClick={() => downloadInvoiceHtmlPdf(r)}>
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