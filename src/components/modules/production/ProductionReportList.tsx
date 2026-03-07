'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { reports: any[] }

const SHIFT_VARIANT: Record<string, any> = {
  Day: 'success',
  Night: 'info',
  General: 'default',
}

export default function ProductionReportList({ reports }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [shift, setShift] = useState('')

  const filtered = reports.filter(r => {
    const matchSearch =
      r.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.route_card?.route_card_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.machine_no?.toLowerCase().includes(search.toLowerCase())
    const matchShift = shift ? r.shift === shift : true
    return matchSearch && matchShift
  })

  const totalProduced = reports.reduce((s, r) => s + Number(r.production_qty), 0)
  const totalRejected = reports.reduce((s, r) => s + Number(r.rejection_qty), 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Production Reports</h1>
          <p className={styles.subtitle}>
            {reports.length} entries • Produced: {totalProduced} • Rejected: {totalRejected}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Production Reports',
            subtitle: `${filtered.length} entries · Total Produced: ${totalProduced} · Total Rejected: ${totalRejected}`,
            columns: [
              { header: 'Date', dataKey: 'report_date' },
              { header: 'Route Card', dataKey: 'route_card_no' },
              { header: 'Product', dataKey: 'product_name' },
              { header: 'Machine', dataKey: 'machine_no' },
              { header: 'Operator', dataKey: 'operator_name' },
              { header: 'Shift', dataKey: 'shift', align: 'center' },
              { header: 'Produced', dataKey: 'production_qty', align: 'right' },
              { header: 'Rejected', dataKey: 'rejection_qty', align: 'right' },
            ],
            rows: filtered.map(r => ({
              ...r,
              report_date: fmtDate(r.report_date) || '',
              route_card_no: r.route_card?.route_card_no || '—',
              product_name: r.product?.name || '—',
              machine_no: r.machine_no || '—',
              operator_name: r.operator?.name || '—',
              shift: r.shift || '—',
              production_qty: Number(r.production_qty) || 0,
              rejection_qty: Number(r.rejection_qty) || 0,
            })),
            fileName: 'Production_Reports'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/production/report/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/production/report/new')}>
            + New Report
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by product, route card or machine..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect}
          value={shift} onChange={e => setShift(e.target.value)}>
          <option value="">All Shifts</option>
          <option value="Day">Day</option>
          <option value="Night">Night</option>
          <option value="General">General</option>
        </select>
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'report_date', label: 'Date' },
            { key: 'route_card', label: 'Route Card', render: v => (v as any)?.route_card_no ?? '—' },
            { key: 'product', label: 'Product', render: v => (v as any)?.name ?? '—' },
            { key: 'machine_no', label: 'Machine', render: v => v as string || '—' },
            { key: 'operator', label: 'Operator', render: v => (v as any)?.name ?? '—' },
            {
              key: 'shift', label: 'Shift', align: 'c',
              render: v => <Badge label={v as string} variant={SHIFT_VARIANT[v as string]} />
            },
            { key: 'production_qty', label: 'Produced', align: 'c' },
            { key: 'rejection_qty', label: 'Rejected', align: 'c' },
            {
              key: 'id', label: 'Actions', align: 'c',
              render: v => (
                <div className={styles.actions}>
                  <button className={styles.editBtn}
                    onClick={() => router.push(`/dashboard/production/report/${v}`)}>
                    Edit
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