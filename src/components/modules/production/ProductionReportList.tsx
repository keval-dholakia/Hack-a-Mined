'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import styles from './Production.module.scss'

type Props = { reports: any[] }

const SHIFT_VARIANT: Record<string, any> = {
  Day:     'success',
  Night:   'info',
  General: 'default',
}

export default function ProductionReportList({ reports }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [shift,  setShift]  = useState('')

  const filtered = reports.filter(r => {
    const matchSearch =
      r.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.route_card?.route_card_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.machine_no?.toLowerCase().includes(search.toLowerCase())
    const matchShift = shift ? r.shift === shift : true
    return matchSearch && matchShift
  })

  const totalProduced  = reports.reduce((s, r) => s + Number(r.production_qty), 0)
  const totalRejected  = reports.reduce((s, r) => s + Number(r.rejection_qty),  0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Production Reports</h1>
          <p className={styles.subtitle}>
            {reports.length} entries • Produced: {totalProduced} • Rejected: {totalRejected}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/production/report/new')}>
          + New Report
        </Button>
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
            { key: 'report_date',   label: 'Date'        },
            { key: 'route_card',    label: 'Route Card',  render: v => (v as any)?.route_card_no ?? '—' },
            { key: 'product',       label: 'Product',     render: v => (v as any)?.name ?? '—' },
            { key: 'machine_no',    label: 'Machine',     render: v => v as string || '—' },
            { key: 'operator',      label: 'Operator',    render: v => (v as any)?.name ?? '—' },
            { key: 'shift', label: 'Shift', align: 'c',
              render: v => <Badge label={v as string} variant={SHIFT_VARIANT[v as string]} />
            },
            { key: 'production_qty',label: 'Produced',   align: 'c' },
            { key: 'rejection_qty', label: 'Rejected',   align: 'c' },
            { key: 'id', label: 'Actions', align: 'c',
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