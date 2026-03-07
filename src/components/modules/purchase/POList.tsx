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

type Props = { orders: any[] }

const STATUS_VARIANT: Record<string, any> = {
  Open: 'info',
  Partial: 'warning',
  Received: 'success',
  Cancelled: 'danger',
}

export default function POList({ orders }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = orders.filter(o => {
    const matchSearch =
      o.po_no.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? o.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Purchase Orders</h1>
          <p className={styles.subtitle}>{orders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Purchase Order Registry',
            subtitle: `${filtered.length} orders`,
            columns: [
              { header: 'PO No', dataKey: 'po_no' },
              { header: 'Vendor', dataKey: 'vendor_name' },
              { header: 'PO Date', dataKey: 'po_date' },
              { header: 'Valid Until', dataKey: 'valid_until' },
              { header: 'Delivery', dataKey: 'delivery_date' },
              { header: 'Status', dataKey: 'status' },
            ],
            rows: filtered.map(o => ({
              ...o,
              vendor_name: o.vendor?.name || '—',
              po_date: o.po_date ? fmtDate(o.po_date) : '—',
              valid_until: o.valid_until ? fmtDate(o.valid_until) : '—',
              delivery_date: o.delivery_date ? fmtDate(o.delivery_date) : '—',
              status: o.status || '—'
            })),
            fileName: 'PO_Registry'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/po/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/purchase/po/new')}>
            + New PO
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by PO no or vendor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Partial">Partial</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'po_no', label: 'PO No' },
            { key: 'vendor', label: 'Vendor', render: v => (v as any)?.name ?? '—' },
            { key: 'po_date', label: 'PO Date' },
            { key: 'valid_until', label: 'Valid Until', render: v => v as string || '—' },
            { key: 'delivery_date', label: 'Delivery', render: v => v as string || '—' },
            {
              key: 'status', label: 'Status', align: 'c',
              render: v => <Badge label={v as string} variant={STATUS_VARIANT[v as string]} />
            },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: (v, r: any) => {
                const totalAmount = r.items?.reduce((sum: number, i: any) => sum + (Number(i.quantity) * Number(i.unit_price)), 0) || 0
                return (
                  <div className={styles.actions}>
                    <button className={styles.editBtn}
                      onClick={() => router.push(`/dashboard/purchase/po/${v}`)}>
                      Edit
                    </button>
                    <button className={styles.editBtn}
                      title="Download PO PDF"
                      onClick={() => downloadTransactionHtmlPdf({
                        type: 'Purchase Order',
                        voucherNo: r.po_no || `PO-${v}`,
                        date: r.po_date || 'N/A',
                        partyName: r.vendor?.name || 'Unknown Vendor',
                        amount: totalAmount,
                        narration: `Purchase Order for ${r.items?.length || 0} items`,
                        entries: r.items?.map((i: any) => ({
                          label: `${i.product?.name || 'Item'} (${i.quantity} @ ₹${i.unit_price})`,
                          debit: Number(i.quantity) * Number(i.unit_price),
                          credit: 0
                        })) || [],
                        extras: {
                          'Delivery Date': r.delivery_date ? fmtDate(r.delivery_date) : 'N/A',
                          'Valid Until': r.valid_until ? fmtDate(r.valid_until) : 'N/A',
                          'Status': r.status || 'N/A'
                        }
                      })}>
                      PDF
                    </button>
                  </div>
                )
              }
            },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}