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

type Props = { entries: any[] }

const RESULT_VARIANT: Record<string, any> = {
  Pass: 'success',
  Fail: 'danger',
  Partial: 'warning',
}

export default function IQCList({ entries }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = entries.filter(e =>
    e.grn?.grn_no.toLowerCase().includes(search.toLowerCase()) ||
    e.product?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>IQC Entries</h1>
          <p className={styles.subtitle}>{entries.length} total checks</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <DownloadButton variant="list" onClick={() => downloadTablePdf({
            title: 'IQC Report Registry',
            subtitle: `${filtered.length} checks`,
            columns: [
              { header: 'GRN Ref', dataKey: 'grn_no' },
              { header: 'Product', dataKey: 'product_name' },
              { header: 'Date', dataKey: 'check_date' },
              { header: 'Total Qty', dataKey: 'total_qty', align: 'right' },
              { header: 'Accepted', dataKey: 'accepted_qty', align: 'right' },
              { header: 'Rejected', dataKey: 'rejected_qty', align: 'right' },
              { header: 'Visual', dataKey: 'visual_check', align: 'center' },
              { header: 'Dimension', dataKey: 'dimension_check', align: 'center' },
              { header: 'Result', dataKey: 'result', align: 'center' },
            ],
            rows: filtered.map(e => ({
              ...e,
              grn_no: e.grn?.grn_no || '—',
              product_name: e.product?.name || '—',
              check_date: e.check_date ? fmtDate(e.check_date) : '—',
              total_qty: Number(e.total_qty) || 0,
              accepted_qty: Number(e.accepted_qty) || 0,
              rejected_qty: Number(e.rejected_qty) || 0,
              visual_check: e.visual_check || '—',
              dimension_check: e.dimension_check || '—',
              result: e.result || '—'
            })),
            fileName: 'IQC_Registry'
          })} />
          <Button variant="ghost" onClick={() => router.push('/dashboard/purchase/iqc/analytics')}>
            ◎ Analytics
          </Button>
          <Button onClick={() => router.push('/dashboard/purchase/iqc/new')}>+ New IQC</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput}
          placeholder="Search by GRN no or product..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card noPad>
        <Table
          columns={[
            { key: 'grn', label: 'GRN Ref', render: v => (v as any)?.grn_no ?? '—' },
            { key: 'product', label: 'Product', render: v => (v as any)?.name ?? '—' },
            { key: 'check_date', label: 'Date' },
            { key: 'total_qty', label: 'Total Qty', align: 'c' },
            { key: 'accepted_qty', label: 'Accepted', align: 'c' },
            { key: 'rejected_qty', label: 'Rejected', align: 'c' },
            {
              key: 'visual_check', label: 'Visual', align: 'c',
              render: v => <Badge label={v as string} variant={v === 'Pass' ? 'success' : 'danger'} />
            },
            {
              key: 'dimension_check', label: 'Dimension', align: 'c',
              render: v => <Badge label={v as string} variant={v === 'Pass' ? 'success' : 'danger'} />
            },
            {
              key: 'result', label: 'Result', align: 'c',
              render: v => <Badge label={v as string} variant={RESULT_VARIANT[v as string]} />
            },
          ]}
          rows={filtered}
        />
      </Card>
    </div>
  )
}