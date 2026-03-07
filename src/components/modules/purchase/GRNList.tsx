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
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { grns: any[] }

const STATUS_VARIANT: Record<string, any> = {
  Pending: 'warning',
  'IQC Done': 'info',
  Received: 'success',
}

export default function GRNList({ grns }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const filtered = grns.filter(g => {
    const matchSearch =
      g.grn_no.toLowerCase().includes(search.toLowerCase()) ||
      g.vendor?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status ? g.status === status : true
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>GRN</h1>
          <p className={styles.subtitle}>{grns.length} total receipts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'GRN Registry',
            subtitle: `${filtered.length} receipts`,
            columns: [
              { header: 'GRN No', dataKey: 'grn_no' },
              { header: 'Vendor', dataKey: 'vendor_name' },
              { header: 'PO Ref', dataKey: 'po_no' },
              { header: 'Entry Date', dataKey: 'gate_entry_date' },
              { header: 'Challan No', dataKey: 'vendor_challan_no' },
              { header: 'Warehouse', dataKey: 'warehouse_name' },
              { header: 'Status', dataKey: 'status' },
            ],
            rows: filtered.map(g => ({
              ...g,
              vendor_name: g.vendor?.name || '—',
              po_no: g.purchase_order?.po_no || '—',
              gate_entry_date: g.gate_entry_date ? fmtDate(g.gate_entry_date) : '—',
              vendor_challan_no: g.vendor_challan_no || '—',
              warehouse_name: g.warehouse?.name || '—',
              status: g.status || '—'
            })),
            fileName: 'GRN_Registry'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/grn/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/purchase/grn/new')}>+ New GRN</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by GRN no or vendor..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect}
          value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="IQC Done">IQC Done</option>
          <option value="Received">Received</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'grn_no', label: 'GRN No' },
            { key: 'vendor', label: 'Vendor', render: v => (v as any)?.name ?? '—' },
            { key: 'purchase_order', label: 'PO Ref', render: v => (v as any)?.po_no ?? '—' },
            { key: 'gate_entry_date', label: 'Entry Date' },
            { key: 'vendor_challan_no', label: 'Challan No', render: v => v as string || '—' },
            { key: 'warehouse', label: 'Warehouse', render: v => (v as any)?.name ?? '—' },
            {
              key: 'status', label: 'Status', align: 'c',
              render: v => <Badge label={v as string} variant={STATUS_VARIANT[v as string]} />
            },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/purchase/grn/${v}`)}>Edit</button>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/purchase/iqc/new?grn=${v}`)}>IQC</button>
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