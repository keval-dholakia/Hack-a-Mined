'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'
import DownloadButton from '@/components/ui/DownloadButton'
import { downloadTablePdf } from '@/lib/pdf/downloadTablePdf'
import { fmtDate } from '@/lib/pdf/pdfConstants'

type Props = { issues: any[] }

export default function MaterialIssueList({ issues }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = issues.filter(i =>
    i.issue_no.toLowerCase().includes(search.toLowerCase()) ||
    i.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    i.route_card?.route_card_no.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Material Issues</h1>
          <p className={styles.subtitle}>{issues.length} total issues</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'Material Issue Notes',
            subtitle: `${filtered.length} issues`,
            columns: [
              { header: 'Issue No.', dataKey: 'issue_no' },
              { header: 'Date', dataKey: 'issue_date' },
              { header: 'Route Card', dataKey: 'route_card_no' },
              { header: 'Product', dataKey: 'product_name' },
              { header: 'Warehouse', dataKey: 'warehouse_name' },
              { header: 'Requested', dataKey: 'qty_requested', align: 'right' },
              { header: 'Issued', dataKey: 'qty_issued', align: 'right' },
            ],
            rows: filtered.map(i => ({
              ...i,
              issue_date: fmtDate(i.issue_date),
              route_card_no: i.route_card?.route_card_no || '—',
              product_name: i.product?.name || '—',
              warehouse_name: i.warehouse?.name || '—',
              qty_requested: Number(i.qty_requested) || 0,
              qty_issued: Number(i.qty_issued) || 0,
            })),
            fileName: 'Material_Issue_Notes'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/production/material-issue/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/production/material-issue/new')}>
            + New Issue
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by issue no, product or route card..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'issue_no', label: 'Issue No' },
            { key: 'route_card', label: 'Route Card', render: v => (v as any)?.route_card_no ?? '—' },
            { key: 'product', label: 'Product', render: v => (v as any)?.name ?? '—' },
            { key: 'warehouse', label: 'Warehouse', render: v => (v as any)?.name ?? '—' },
            { key: 'issue_date', label: 'Date' },
            { key: 'qty_requested', label: 'Requested', align: 'c' },
            { key: 'qty_issued', label: 'Issued', align: 'c' },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}