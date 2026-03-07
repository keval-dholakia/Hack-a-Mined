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

type Props = { saleOrders: any[] }

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success'> = {
  Pending: 'warning',
  Dispatched: 'info',
  Closed: 'success',
}

export default function SaleOrderList({ saleOrders }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = saleOrders.filter(so => {
    const matchSearch =
      so.so_no.toLowerCase().includes(search.toLowerCase()) ||
      so.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      so.customer_po_no?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? so.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sale Orders</h1>
          <p className={styles.subtitle}>{saleOrders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Sale Order Registry',
            subtitle: `${filtered.length} orders`,
            columns: [
              { header: 'SO No', dataKey: 'so_no' },
              { header: 'Customer', dataKey: 'customer_name' },
              { header: 'Customer PO', dataKey: 'customer_po_no' },
              { header: 'SO Date', dataKey: 'so_date' },
              { header: 'Delivery', dataKey: 'delivery_date' },
              { header: 'Transporter', dataKey: 'transporter_name' },
              { header: 'Status', dataKey: 'status' },
            ],
            rows: filtered.map(so => ({
              ...so,
              customer_name: so.customer?.name || '—',
              customer_po_no: so.customer_po_no || '—',
              so_date: so.so_date ? fmtDate(so.so_date) : '—',
              delivery_date: so.delivery_date ? fmtDate(so.delivery_date) : '—',
              transporter_name: so.transporter?.name || '—',
              status: so.status || '—'
            })),
            fileName: 'Sale_Order_Registry'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/sales/sale-order/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/sales/sale-order/new')}>
            + New Sale Order
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search by SO no, customer or PO no..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'so_no', label: 'SO No' },
            {
              key: 'customer', label: 'Customer',
              render: v => (v as any)?.name ?? '—'
            },
            {
              key: 'customer_po_no', label: 'Customer PO',
              render: v => v as string || '—'
            },
            { key: 'so_date', label: 'SO Date' },
            {
              key: 'delivery_date', label: 'Delivery',
              render: v => v as string || '—'
            },
            {
              key: 'transporter', label: 'Transporter',
              render: v => (v as any)?.name ?? '—'
            },
            {
              key: 'status', label: 'Status', align: 'c',
              render: v => (
                <Badge
                  label={v as string}
                  variant={STATUS_VARIANT[v as string]}
                />
              )
            },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: (v, r: any) => {
                const totalAmount = r.items?.reduce((sum: number, i: any) => sum + (Number(i.quantity) * Number(i.rate)), 0) || 0
                return (
                  <div className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => router.push(`/dashboard/sales/sale-order/${v}`)}
                    >
                      Edit
                    </button>
                    <button className={styles.editBtn}
                      onClick={() => downloadTransactionHtmlPdf({
                        type: 'Sale Order',
                        voucherNo: r.so_no || `SO-${v}`,
                        date: r.so_date || 'N/A',
                        partyName: r.customer?.name || 'Unknown Customer',
                        amount: totalAmount,
                        narration: `Sale Order for ${r.items?.length || 0} items. Customer PO: ${r.customer_po_no || 'N/A'}`,
                        entries: r.items?.map((i: any) => ({
                          label: `${i.product?.name || 'Item'} (${i.quantity} @ ₹${i.rate})`,
                          credit: Number(i.quantity) * Number(i.rate),
                          debit: 0
                        })) || [],
                        extras: {
                          'Delivery Date': r.delivery_date ? fmtDate(r.delivery_date) : 'N/A',
                          'Transporter': r.transporter?.name || 'N/A',
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